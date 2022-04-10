import json
import math
import os
import os.path
import sys
import subprocess
import tempfile
import cv2 as cv
import numpy as np


def main():
    with tempfile.TemporaryDirectory() as dir:
        screen_file = os.path.join(dir, 'screen.png')
        if False:
            screen_file = 'screen.png'
        with open(screen_file, 'w') as outfile:
            subprocess.run(['adb', 'exec-out', 'screencap', '-p'], stdout=outfile)
        img = cv.imread(screen_file)
    # Mask out top and bottom parts
    h, w, _ = img.shape
    top, bottom = 500, 200
    masked = img.copy()
    cv.fillPoly(masked, np.array([[(0, 0), (0, top), (w, top), (w, 0)]]), (0, 0, 0))
    cv.fillPoly(masked, np.array([[(0, h - bottom), (0, h), (w, h), (w, h - bottom)]]), (0, 0, 0))
    if False:
        cv.imwrite('masked.png', masked)

    # Convert to binary and identify connected components
    gray = cv.cvtColor(masked, cv.COLOR_BGR2GRAY)
    _, binary = cv.threshold(gray, 200, 255, cv.THRESH_BINARY)
    _, _, stats, centers = cv.connectedComponentsWithStats(binary)

    # Remove the outermost component
    stats = stats[1:]
    centers = np.uint16(np.around(centers[1:]))

    # Check the bounding rectangle of all components are squares of the same
    # size, and find the diameter of the circles
    rects = np.unique(stats[:,2:4], axis=0)
    if len(rects) != 1:
        print('Different bounding rectangle sizes:', rects)
        sys.exit(1)
    sides = np.unique(rects)
    if len(sides) != 1:
        print('Bounding rectangle not a square:', sides)
        sys.exit(1)
    diam = sides[0]

    groups = group_points(centers, diam * 1.2)

    bottles = [group[0] for group in groups]
    delta = bottles[-1] - bottles[-2]
    bottles += [bottles[-1] + delta, bottles[-1] + 2 * delta]
    if False:
        print(bottles)

    if False:
        annotated = img.copy()
        for p in centers:
            cv.circle(annotated, p, 2, (255, 255, 255), 4)
        for group in groups:
            for i in range(len(group)-1):
                cv.line(annotated, group[i], group[i+1], (255, 255, 255), 3)
        cv.imwrite('annotated.png', annotated)

    group_colors = []
    known_colors = {}
    solve_args = []

    for group in groups:
        colors = []
        for p in group:
            pixel = tuple(img[p[1], p[0]])
            if pixel not in known_colors:
                known_colors[pixel] = len(known_colors)
            colors.append(known_colors[pixel])
        group_colors.append(colors)
        solve_args.append(''.join(chr(ord('A') + x) for x in colors))
    print('Parsed screen')
    solve_args += ['', '']
    if False:
        print(solve_args)

    print('Finding solution')
    steps = None
    with subprocess.Popen(['node', 'solve.js'] + solve_args, stdout=subprocess.PIPE) as proc:
        for line in proc.stdout:
            obj = json.loads(line)
            t, s = obj['type'], obj['size']
            if t == 'solution':
                print(f'Found solution with {s} steps')
                steps = obj['steps']
            elif t == 'no-solution':
                print(f'No solution within {s} steps')
            if False:
                sys.stdout.write(line.decode())
    if False:
        print(steps)

    print('Actuating solution')
    with subprocess.Popen(['adb', 'shell'], stdin=subprocess.PIPE) as proc:
        for src, dst in steps:
            src_x, src_y = bottles[src]
            proc.stdin.write(f'input tap {src_x} {src_y}\n'.encode())
            proc.stdin.write(b'sleep 0.1\n')
            dst_x, dst_y = bottles[dst]
            proc.stdin.write(f'input tap {dst_x} {dst_y}\n'.encode())
            proc.stdin.write(b'sleep 0.1\n')


def group_points(ps, maxd):
    group = np.ones([len(ps)], dtype=int) * -1
    g = 0
    for i, _ in enumerate(ps):
        if group[i] >= 0:
            continue
        group[i] = g
        queue = [i]
        while len(queue) > 0:
            u = queue[0]
            queue = queue[1:]
            for v, _ in enumerate(ps):
                if group[v] >= 0:
                    continue
                if np.sum((ps[u].astype(int) - ps[v].astype(int)) ** 2) > maxd ** 2:
                    continue
                group[v] = g
                queue.append(v)
        g += 1
    groups = [[] for i in range(g)]
    for i, g in enumerate(group):
        groups[g].append(ps[i])
    return groups


if __name__ == '__main__':
    main()
