import json, pathlib, importlib.util
from jsonschema import validate
import yaml, time

SKILLS_DIR = pathlib.Path("/app/skills")
OUT_DIR = pathlib.Path("/app/runtime")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def load_skill(folder: pathlib.Path):
    meta = yaml.safe_load((folder / "skill.yaml").read_text(encoding="utf-8"))
    in_schema = json.loads((folder / "schema.input.json").read_text(encoding="utf-8"))
    out_schema = json.loads((folder / "schema.output.json").read_text(encoding="utf-8"))
    run_path = folder / "run.py"
    spec = importlib.util.spec_from_file_location(f"skill_{meta['id']}", run_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore
    return meta, in_schema, out_schema, mod

def main():
    print("[worker] bootstrap: running sample inputs for each skill folder")
    for folder in sorted(SKILLS_DIR.iterdir()):
        if not folder.is_dir() or folder.name.startswith("_"):
            continue
        try:
            meta, in_schema, out_schema, mod = load_skill(folder)
            sample = folder / "sample.input.json"
            if sample.exists():
                payload = json.loads(sample.read_text(encoding="utf-8"))
                validate(payload, in_schema)
                result = mod.run(payload)
                validate(result, out_schema)
                out = OUT_DIR / f"sample_output_{meta['id']}.json"
                out.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
                print(f"[worker] {meta['id']} OK -> {out.name}")
        except Exception as e:
            print(f"[worker] {folder.name} ERROR: {e}")
    print("[worker] idle (add queue/scheduler next).")
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
