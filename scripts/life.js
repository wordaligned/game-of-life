$(function() {
    var life_canvas = $('#lifecanvas')[0],
    life_context = life_canvas.getContext('2d'),
    timer = 0,
    frame_delay_msecs = 100,
    cell_size = 5,
    cells_w = life_context.canvas.width / cell_size,
    cells_h = life_context.canvas.height / cell_size;

    // Create and return an h x w array
    var create_cells = function(w, h) {
        var cells = new Array(h);
        for (var i = 0; i < cells.length; i++) {
            cells[i] = new Array(w);
        }
        return cells;
    }
    
    // Iterate over a 2D array, applying the supplied function to each element
    var foreach_cell = function(cells, fn) {
        for (var i = 0; i < cells.length; i++) {
            for (var j = 0; j < cells[i].length; j++) {
                fn(i, j);
            }
        }
        return cells;
    }

    // Set all cells to zero
    var clear_cells = function(cells) {
        return foreach_cell(cells, function(i, j) { cells[i][j] = 0; });
    }

    var cells = clear_cells(create_cells(cells_w, cells_h));

    // Pause game of life
    var pause = function() {
        if (timer) {
            clearInterval(timer);
            timer = 0;
        }
        $('#toggle').attr('title', 'Play').click(play).html('<img src="images/glyphicons_173_play.png" />');
    }

    // Play game of life
    var play = function() {
        if (!timer) {
            timer = setInterval(step, frame_delay_msecs);
        }
        $('#toggle').attr('title', 'Pause').click(pause).html('<img src="images/glyphicons_174_pause.png" />');
    }
    
    // Take a step in game of life
    var step = function() {
        var new_cells = create_cells(cells_w, cells_h);
        foreach_cell(cells, function(i, j) {
            new_cells[i][j] = fate(i, j);
        });
        cells = new_cells;
        draw_pattern(life_context, cells);
    }

    // Draw the pattern on the supplied canvas context
    var draw_pattern = function(context, cells) {
        var s = cell_size;
        foreach_cell(cells, function(i, j) {
            if (cells[i][j]) {
                context.fillRect(j * s, i * s, s, s);
            } else {
                context.clearRect(j * s, i * s, s, s);
            }
        });
    }

    // Clear the canvas
    var clear = function() {
        pause();
        cells = clear_cells(cells);
        draw_pattern(life_context, cells);
    }

    // Single step the game of life
    var single_step = function() {
        pause();
        step();
    }

    // Determine the fate of cell i, j
    // Returns 1 for "lives", 0 for "dies"
    var fate = function(i, j) {
        var h = cells_h,
            w = cells_w,
            neighbours = [[-1,-1],[-1,0],[-1,1],
                          [0,-1],        [0,1],
                          [1,-1], [1,0], [1,1]];
            live_neighbours = 0;

        neighbours.forEach(function(n) {
            live_neighbours += cells[(i + h + n[0]) % h][(j + w + n[1]) % w];
        });

        return live_neighbours == 3 || cells[i][j] && live_neighbours == 2 ? 1 : 0;
    }

    // Rotate the reference pattersns
    var rotate = function() {
        $('#patterns canvas').each(function(_, pattern) {
            var p = $(pattern).attr('id'),
            cells = patterns[p],
            w = cells[0].length, h = cells.length,
            new_cells = create_cells(h, w);
            foreach_cell(cells, function(i, j) {
                new_cells[j][h-i-1] = cells[i][j];
            });
            patterns[p] = new_cells;
            draw_pattern(this.getContext('2d'), new_cells);
        });
    }

    // Enable the mouse to draw cells on the canvas
    var enable_mouse_sketcher = function(canvas) {
        var active = false, s = cell_size;

        var draw_pt = function(ev) {
            var canvas_pos = $('#lifecanvas').position(),
                x = ev.pageX - canvas_pos.left,
                y = ev.pageY - canvas_pos.top,
                j = Math.floor(x/s), 
                i = Math.floor(y/s);
            cells[i][j] = 1;
            life_context.fillRect(j * s, i * s, s, s);
        }

        canvas.addEventListener('mousedown', function(ev) { active = true; draw_pt(ev); });
        canvas.addEventListener('mouseup', function() { active = false; });
        canvas.addEventListener('mousemove', function(ev) { if (active) draw_pt(ev); });
    }

    // Drop the pattern on the canvas
    var drop_pattern = function(event, ui) {
        var pattern = patterns[ui.draggable.attr("id")],
        canvas_pos = $(this).position(),
        pattern_pos = ui.offset,
        w = cells_w,
        h = cells_h,
        j1 = Math.floor(w + (pattern_pos.left - canvas_pos.left) / cell_size),
        i1 = Math.floor(h + (pattern_pos.top - canvas_pos.top) / cell_size);

        foreach_cell(pattern, function(i, j) {
            cells[(i1 + i) % h][(j1 + j) % w] = pattern[i][j];
        });
        draw_pattern(life_context, cells);
    }

    $('#lifecanvas').droppable({
        drop: drop_pattern
    });

    var populate = function() {
        var canvas = $(this), 
        pattern = patterns[canvas.attr('id')],
        type = canvas.data('type'), 
        context = this.getContext('2d');
        context.fillStyle = pattern_colours[type];
        draw_pattern(context, pattern);
    }
    
    // Fill the life canvas with a random pattern
    var random = function() {
        foreach_cell(cells, function(i, j) { cells[i][j] = Math.floor(Math.random() * 2); });
        draw_pattern(life_context, cells);
    }

    // Populate and activate the reference patterns
    $('#patterns canvas').each(populate).draggable({
        revert: true
    });

    // Add some help text to the canvas
    var add_help = function() {
        clear();
        pause();
        life_context.font = "18px sans-serif";
        life_context.fillStyle = '#666';
        life_context.fillText("Roll the dice for a random pattern", 25, 50);
        life_context.fillText("Use the mouse to pick cells directly", 25, 70);
        life_context.fillText("Drag ready-made patterns here to use them", 25, 90);
        life_context.fillText("Rotate the ready-made patterns", 25, 110);
        life_context.fillText("Play, pause, step and watch the colony evolve", 25, 130);
        life_context.fillStyle = '#000';
    }

    // Activate buttons
    $('#clear').click(clear);
    $('#random').click(random);
    $('#rotate').click(rotate);
    $('#step').click(single_step);
    $('#info').click(add_help);
    $('#key').draggable();
    $('.domain').draggable();
    enable_mouse_sketcher(life_canvas);
    add_help();
});
