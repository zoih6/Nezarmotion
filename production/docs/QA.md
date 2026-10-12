# QA gates (copy into the progress doc and tick them)

## Per shot (check on the contact sheet, at 3 moments: entry · mid · just before exit)
- [ ] Starts on its VO word (±0.15 s); on-screen words appear when spoken.
- [ ] One focal point; ≤ 1 hero + 1 card + 2 supports; ≥ 35 % quiet space.
- [ ] All text ≥ 34 px, inside 96 px margins, contrast OK (no gold-on-parchment hairlines, no dark-on-dark).
- [ ] Card is in the third opposite the subject; nothing overlaps a face or the artefact's key detail.
- [ ] Every element has an entrance motion (spring) and a motivated exit; nothing just fades.
- [ ] Real artefact is cropped to its meaningful part; overlays are pinned in image pixels.
- [ ] No spelling mistakes (Arabic: dots, hamzas, diacritics, Arabic-Indic numerals).
- [ ] An empty card at a sampled time is only acceptable if its text is about to write on — re-sample 0.8 s later to confirm.

## Per section
- [ ] ≥ 3 critique rounds (contact sheet → list problems → fix → re-render) — note them in PROGRESS.md.
- [ ] Rhythm: a new idea every 2–4 s; the section has a build and a climax.
- [ ] Transition into the next section is motivated and RTL/LTR-correct.
- [ ] Style matches the style bible (palette, faces, surfaces, light, grade).

## Final
- [ ] Frame count = round(VO duration × fps); duration matches the VO to the frame.
- [ ] `ebur128` integrated −14 ±1 LUFS; true peak ≤ −1.5 dBTP; listened to start / dense part / end.
- [ ] Spot-check sync at 5 key words across the film (scrub the final file, not the stills).
- [ ] 1080p ≈ 3.4 Mbps (≈100 MB per 4 min) + 720p version; `+faststart`; plays in a browser.
- [ ] Release created with final_1080p.mp4, final_720p.mp4, poster.jpg, contact.jpg; links tested (HTTP 200).
- [ ] Code/assets/docs pushed; PROGRESS.md has resume instructions; workspace cleaned; tokens deleted.
