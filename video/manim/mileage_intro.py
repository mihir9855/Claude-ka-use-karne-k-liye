"""Sample Manim scene: a short mileage stat animation (no LaTeX needed).

Render (low quality preview):  manim -ql mileage_intro.py MileageIntro
Render (1080p):               manim -qh mileage_intro.py MileageIntro
"""
from manim import (
    BLUE_C, DOWN, UP, WHITE, Create, FadeIn, Rectangle, Scene, Text, ValueTracker, Write, always_redraw,
)

TEAL = "#0f8f7a"


class MileageIntro(Scene):
    def construct(self):
        self.camera.background_color = "#12181c"
        title = Text("Mileage Log", font_size=64, color=WHITE).to_edge(UP)
        self.play(Write(title))

        kmpl = ValueTracker(0)
        # Text (not DecimalNumber) so no LaTeX install is needed.
        number = always_redraw(lambda: Text(f"{kmpl.get_value():.1f}", font_size=96, color=TEAL))
        unit = Text("km / litre", font_size=36, color=BLUE_C).shift(DOWN * 1.2)
        self.play(FadeIn(number), FadeIn(unit))
        self.play(kmpl.animate.set_value(42.5), run_time=2)

        bar = Rectangle(width=6, height=0.3, color=TEAL, fill_opacity=0.8).next_to(unit, DOWN, buff=0.6)
        self.play(Create(bar))
        self.wait(0.5)
