#! /usr/bin/env python
""" Code used to generate javascript, html and GIFs for a canvas-based implementation of
John Conway's game of life.
"""
import os

SIDE = 7 # Length, in pixels, of a cell

SCRIPT_DIR = 'scripts' # where to write js files
IMAGE_DIR = 'images'   # where to put graphic files
RLE_DIR = 'patterns'   # where to find the RLE patterns

# We'll assign the patterns colours in the web client
PATTERN_COLOURS = {
    'still_life' : '#666',
    'oscillator' : '#58ACFA',
    'gun' : '#B43104', 
    'spaceship' : '#31B404', 
    'methuselah' : '#2E64FE',
    'puffer' : '#DF7401' 
    }

def create_pattern_colours():
    ''' Creates 1x1 gifs and a js file with the pattern colours.

    Note: makes a system call to the Imagemagick "convert" tool.
    '''
    open(os.path.join(SCRIPT_DIR, 'pattern_colours.js'), 'w').write(
        'var pattern_colours = %r;\n' % PATTERN_COLOURS)
    for p, c in PATTERN_COLOURS.items():
        os.system('convert xc:%s %s' %
                  (c, os.path.join(IMAGE_DIR, '%s.gif' % p)))

def create_javascript(patterns):
    ''' Write the expanded life patterns as javascript arrays. '''
    open(os.path.join(SCRIPT_DIR, 'patterns.js'), 'w').write('''\
var patterns = {
%s
};
''' % '\n'.join('"%s": %r,' % (name, cells) for typ, name, _, cells in patterns))

def create_html(patterns):
    ''' Write the canvas representations of the patterns into life.html '''
    pattern_canvas = '<canvas data-type="%s" id="%s" class="ui-widget-content" width="%d" height="%d" title="%s"></canvas>'
    html = open('life.html').read()
    begin = '<!--BEGIN PATTERNS-->'
    end = '<!--END PATTERNS-->'
    b = html.find(begin)
    e = html.find(end)
    open('life.html', 'w').write(
        html[:b] + begin + '\n' +
        '\n'.join(pattern_canvas % (t, p, len(cells[0])*SIDE, len(cells)*SIDE, n)
                  for t, p, n, cells in patterns) +
        '\n' + html[e:])

def make_square(pattern):
    ''' Add blank lines to the pattern, making it square.

    (This is so the pattern can be rotated in place).
    '''
    w, h = len(pattern[0]), len(pattern)
    # Ensure the pattern is wider than it is tall (transpose if necessary)
    # the pad with extra rows at top and bottom to make it square (and
    # transpose back if necessary).
    if h > w:
        pattern = transpose(pattern)
    pad = abs(w - h)
    t = pad//2
    b = pad - t
    d = len(pattern[0])
    pattern = ([[0 for i in range(d)] for j in range(t)] + pattern +
               [[0 for i in range(d)] for j in range(b)]) 
    if h > w:
        pattern = transpose(pattern)
    return pattern


def run_length_decode(rle):
    ''' Expand the series of run-length encoded characters.
    '''
    run = ''
    for c in rle:
        if c in '0123456789':
            run += c
        else:
            run = int(run or 1)          # if the run isn't explicitly coded, it has length 1
            v = c if c in 'bo$' else 'b' # treat unexpected cells as dead ('b')
            for _ in range(run):
                yield v
            run = ''

def expand_rle(rle):
    ''' Expand a run-length encoded pattern.

    Returns the pattern name, full name and its cells. http://www.conwaylife.com/wiki/RLE
    '''
    rle_file_name = os.path.join(RLE_DIR, '%s.rle' % rle)
    lines = open(rle_file_name).read().splitlines()
    if lines[0].startswith('#N '):
        name = lines[0][3:]
    else:
        name = rle
    lines = [L for L in lines if not L.startswith('#')]
    header = lines[0]
    xv, yv = header.split(',')[:2]
    x = int(xv.partition('=')[2])
    y = int(yv.partition('=')[2])
    pattern = [[0 for i in range(x)] for j in range(y)]
    body = ''.join(lines[1:])
    body = body[:body.index('!')].lower() # '!' terminates the body
    i, j = 0, 0
    for c in run_length_decode(body):
        if c == '$':
            i, j = i+1, 0
        else:
            if c == 'o':
                pattern[i][j] = 1
            j += 1
    return rle, name, pattern

def transpose(array):
    ''' Transpose a list of lists.
    '''
    return list(map(list, zip(*array)))

def main():
    patterns = {
        'still_life':
         ('block', 'beehive', 'loaf', 'boat'),
        'oscillator':
         ('blinker', 'toad', 'beacon', 'clock', 'jam', 'pentadecathlon',
          '29p9', '1234', 'rats', 'pulsar', 'queenbeeshuttle'),
        'spaceship':
         ('glider', 'lwss', 'mwss', 'hwss', 'sidecar', 'crab', 'turtle', 'orion2', 'canadagoose'),
        'methuselah':
         ('rpentomino', 'acorn', 'rabbits', 'bheptomino'),
        'puffer':
        ('puffer1', 'puffer2', 'noahsark'),
        'gun':
        ('gosperglidergun', 'b52bomber'), 
        }
    patterns = [(typ, expand_rle(p)) for typ, ps in patterns.items() for p in ps]
    patterns = [(typ, p, n, make_square(pattern))
                for typ, (p, n, pattern) in patterns]
    patterns.sort(key=lambda p: len(p[3]))
    create_javascript(patterns)
    create_pattern_colours()
    create_html(patterns)

main()
