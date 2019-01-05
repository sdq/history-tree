let historyTreeView = function() {
    let historyTreeView = {},
        tree = historyTree(),
        margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        container = null,
        svg = null,
        treemap = d3.tree().size([height, width]);

    historyTreeView.container = function(_) {
        if (!arguments.length) return container;
        container = d3.select(_)
            .style('position','relative');
        // svg = container.append("svg")
        //             .attr("width", width + margin.right + margin.left)
        //             .attr("height", height + margin.top + margin.bottom)
        //             .append("g")
        //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        return historyTreeView;
    };

    historyTreeView.load = function(_) {
        tree.load(_)
        return historyTreeView
    }

    historyTreeView.append = function(state) {
        tree.append(state);
        console.log(tree.structure());
        console.log(tree.path());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.undo = function() {
        tree.undo();
        console.log(tree.structure());
        console.log(tree.path());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.redo = function() {
        tree.redo();
        console.log(tree.structure());
        console.log(tree.path());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.reset = function() {
        tree.reset();
        console.log(tree.structure());
        console.log(tree.path());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.revisit = function(_id) {
        tree.revisit(_id);
        console.log(tree.structure());
        console.log(tree.path());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.find = function(_id) {
        return tree.find(_id).structure();
    }

    historyTreeView.path = function(_) {
        return tree.path();
    }

    historyTreeView.structure = function(_) {
        return tree.structure();
    }

    historyTreeView.render = function() {
        container.html("");
        var data = tree.path();
        for (i in data) {
            historyTreeView.addNodeView(data[i], 90*i, 10);
        }
    }

    historyTreeView.addNodeView = function(d, x, y) {
        container.append('div')
            .style('position','absolute')
            .style('left', x + "px")
            .style('top', y + "px")
            .style('width', 80 + "px")
            .style('height', 40 + "px")
            .style('background-color', 'blue')
            .text(d.state)
            .on('mouseover', function() {
                d3.select(this)
                .style('background-color','black');
                console.log(d.state);
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'blue')
            })
    }

    return historyTreeView;
}