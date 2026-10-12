#!/usr/bin/env bash
# Scaffold a new film repo folder from this skill:  tools/new_film.sh /var/tmp/my-film
# → my-film/{film (engine copy), tools, docs (templates), assets/{real,gen}}
set -e; S="$(cd "$(dirname "$0")/.." && pwd)"; D=$1; [ -z "$D" ] && { echo "usage: $0 DEST"; exit 1; }
mkdir -p "$D"/{docs,assets/real,assets/gen,film/assets}
cp -r "$S/engine/." "$D/film/"; rm -rf "$D/film/tmp" "$D/film/segments" "$D/film/renders"
cp -r "$S/tools" "$D/"; cp "$S/package.json" "$S/.gitignore" "$D/"
cp "$S/templates/brief.md" "$S/templates/shotlist.md" "$S/templates/PROGRESS.md" "$D/docs/"
cp "$S/rules/qa_checklist.md" "$D/docs/QA.md"
echo "[]" > "$D/docs/extra_cues.json"
cat > "$D/AGENTS.md" <<EOT
# Film project — built with Motion-Doc Studio
Follow the Motion-Doc Studio skill (SKILL.md / AGENTS.md of the skill repo). Project memory: docs/PROGRESS.md.
Film page: film/index.html · scenes: film/scenes/*.js · tools: tools/ (run from film/: PAGE=index.html ../tools/cs.sh …)
EOT
echo "scaffolded $D — next: cd $D && ./tools/setup.sh && git init -b main"
