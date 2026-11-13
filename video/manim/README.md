# Manim videos

Python animations (math / explainer style) rendered to MP4. Not part of the app build.

```bash
sudo apt-get install -y libpango1.0-dev libcairo2-dev pkg-config ffmpeg   # Linux system libs
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
manim -ql mileage_intro.py MileageIntro   # output in media/videos/
```

`MathTex`/`Tex` also need a LaTeX install (e.g. `texlive-latex-extra`); `Text` does not.
