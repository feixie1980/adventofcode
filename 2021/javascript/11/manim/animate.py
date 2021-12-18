"""

"""
from manim import *

folder = "../output/run"


class Octopus:
    def __init__(self, x, y, energy):
        self.x = x
        self.y = y
        self.energy = energy
        self.vobject = Integer(energy, font_size=40).shift(LEFT * x + DOWN * y)

    def transform_to_value(self, new_value):
        old_vobject = self.vobject
        self.energy = new_value
        self.vobject = Integer(new_value, font_size=40).shift(LEFT * self.x + DOWN * self.y)
        return ReplacementTransform(old_vobject, self.vobject)


def read_number_grid_from_file(file_index):
    filepath = f'{folder}/{file_index}.txt'
    file = open(filepath, 'r')
    lines = file.readlines()
    grid = list(map(lambda line: list(map(lambda n: int(n), line.split(' '))), lines))
    return grid


def create_octopuses_from_grid(grid):
    octopuses = []
    for y, row in enumerate(grid):
        for x, n in enumerate(row):
            octopuses.append(Octopus(x, y, n))
    return octopuses


class Main(MovingCameraScene):
    def construct(self):

        self.camera.frame.scale(1.3)
        octopuses = create_octopuses_from_grid(read_number_grid_from_file(0))
        group = VGroup(*map(lambda o: o.vobject, octopuses))
        group.center()
        self.add(group)

        self.wait()

        for i in range(1, 2):
            grid = read_number_grid_from_file(i)
            transforms = []
            for octopus in octopuses:
                transform = octopus.transform_to_value(grid[octopus.y][octopus.x])
                transforms.append(transform)
            ngroup = VGroup(*map(lambda o: o.vobject, octopuses))
            ngroup.center()
            self.play(ReplacementTransform(group, ngroup))
            self.wait()

    def setup_scene(self):
        self.camera.frame.scale(1.3)
        octopuses = create_octopuses_from_grid(read_number_grid_from_file(0))
        group = VGroup(*map(lambda octopus: octopus.vobject, octopuses))
        group.center()
        self.add(group)
        return octopuses
