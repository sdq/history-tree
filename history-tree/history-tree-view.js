let historyTreeView = function() {
    let historyTreeView = {},
        tree = historyTree(),
        margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        nodeWidth = 65,
        nodeHeight = 30,
        nodeMargin = 10,
        container = null;

    historyTreeView.container = function(_) {
        if (!arguments.length) return container;
        container = d3.select(_)
            .style('position','relative');
        return historyTreeView;
    };

    historyTreeView.load = function(_) {
        tree.load(_)
        return historyTreeView
    }

    historyTreeView.append = function(state) {
        tree.append(state);
        console.log(tree.structure());
        console.log(tree.countPaths());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.undo = function() {
        tree.undo();
        console.log(tree.structure());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.redo = function() {
        tree.redo();
        //console.log(tree.structure());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.reset = function() {
        tree.reset();
        console.log(tree.structure());
        historyTreeView.render(tree.structure())
        return historyTreeView;
    }

    historyTreeView.revisit = function(_id) {
        tree.revisit(_id);
        console.log(tree.structure());
        historyTreeView.render(tree.structure());
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
        console.log("##############render#############");
        container.html("");
        var structure = tree.structure();
        var path = tree.path();
        var node = tree.activeNode();
        historyTreeView.renderPath(path, 0, 10);
        var x_offset = (path.length - 1) * (nodeWidth+nodeMargin);
        var y_offset = 10;
        y_offset += nodeHeight + nodeMargin;
        while (node != null) {
            y_offset = historyTreeView.renderFromNode(node, x_offset, y_offset);
            x_offset = x_offset - (nodeWidth+nodeMargin);
            node = node.father();
        }
    }

    historyTreeView.renderFromNode = function(node, x, y) {
        var dx = nodeWidth + nodeMargin, dy = 0;
        var children = node.children();
        if (children.length > 0) {
            for (i in children) {
                var child = children[i]
                if (tree.path().includes(child._id())) {
                    continue;
                } else {
                    historyTreeView.addInactiveNodeView(child._id(), x + dx, y + dy);
                    historyTreeView.renderFromNode(child, x + dx, y + dy);
                    if (child.activeIndex() == -1) {
                        dy += child.countLeaves() * (nodeHeight + nodeMargin);
                    } else {
                        dy += (child.countLeaves()-1) * (nodeHeight + nodeMargin);
                    }
                }
            }
        }
        return y+dy;
    }

    historyTreeView.renderPath = function(path, x_offset, y_offset) {
        for (i in path) {
            historyTreeView.addNodeView(path[i], (nodeWidth+nodeMargin)*i + x_offset, y_offset);
        }
    }

    historyTreeView.addNodeView = function(d, x, y) {
        container.append('div')
            .style('position','absolute')
            .style('left', x + "px")
            .style('top', y + "px")
            .style('width', 65 + "px")
            .style('height', 30 + "px")
            .style('background-color', 'white')
            .style('border', '2px solid #7ED321')
            .style('border-radius', '5px')
            .text(d)
            .on('mouseover', function() {
                d3.select(this)
                .style('background-color','blue');
                var node = tree.find(d);
                console.log(node.state());
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'white');
            })
    }

    historyTreeView.addInactiveNodeView = function(d, x, y) {
        container.append('div')
            .style('position','absolute')
            .style('left', x + "px")
            .style('top', y + "px")
            .style('width', 65 + "px")
            .style('height', 30 + "px")
            .style('background-color', 'white')
            .style('border', '2px solid black')
            .style('border-radius', '5px')
            .text(d)
            .on('mouseover', function() {
                d3.select(this)
                .style('background-color','blue');
                var node = tree.find(d);
                console.log(node.state());
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'white');
            })
    }

    return historyTreeView;
}