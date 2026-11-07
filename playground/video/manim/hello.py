from manim import *


class Hello(Scene):
    def construct(self):
        circle = Circle(color=BLUE).set_fill(BLUE, opacity=0.4)
        square = Square(color=YELLOW)
        title = Text("Manim").next_to(circle, DOWN)
        self.play(Create(circle), Write(title))
        self.play(Transform(circle, square))
        self.wait(0.5)
