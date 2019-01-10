let historyTreeNode = function() {
    let node = {},
        _id = -1,
        state = "",
        father = null,
        children = [],
        activeIndex = -1;

    node._id = function(_) {
        if (!arguments.length) return _id;
        _id = _;
        return node;
    }

    node.state = function(_) {
        if (!arguments.length) return state;
        state = _;
        return node;
    }

    node.father = function(_) {
        if (!arguments.length) return father;
        father = _;
        return node;
    }

    node.addChild = function(_) {
        if (!arguments.length) return;
        children.push(_);
        activeIndex = children.length - 1
        return node;
    }

    node.children = function() {
        return children;
    }

    node.activeIndex = function(_) {
        if (!arguments.length) return activeIndex;
        activeIndex = _;
        return node;
    }

    node.activeNode = function() {
        if (activeIndex == -1) return null;
        return children[activeIndex];
    }

    node.structure = function() {
        let structure = {
            "id": _id,
            "state": state,
            "active": activeIndex,
            "father": null,
            "children": []
        };
        if (father != null) {
            structure["father"] = father._id();
        };
        for (var i in children) {
            structure.children.push(children[i].structure());
        };
        return structure
    }

    node.path = function() {
        let path = []
        // path.push({
        //     "id": _id,
        //     "state": state
        // });
        path.push(_id);

        if (activeIndex != -1) {
            path = path.concat(children[activeIndex].path())
        }

        return path;
    }

    node.countLeaves = function() {
        var count = 0;
        if (children.length == 0) {
            count = 1
        } else {
            for (i in children) {
                count += children[i].countLeaves();
            }
        }
        return count;
    }

    node.maxDepth = function() {
        var depth = 1;
        if (children.length != 0) {
            var childrenMaxDepth = 1;
            for (i in children) {
                var childrenDepth = children[i].maxDepth();
                if (childrenDepth > childrenMaxDepth) {
                    childrenMaxDepth = childrenDepth;
                }
            }
            depth += childrenMaxDepth;
        }
        return depth;
    }

    return node;
}

let historyTree = function() {
    let tree = {},
        root = null,
        count = 0;

    tree.load = function(_) {
        try {
            var treeJson = JSON.parse(_);
            // TODO: load json to history tree
            return tree
        }
        catch(error) {
            console.error(error);
            return tree
        }
    }

    tree.root = function(_) {
        if (!arguments.length) return root;
        root.state = _;
        return tree;
    }

    tree.activeNode = function() {
        let node = root;
        while(node.activeIndex() != -1) {
            node = node.activeNode();
        }
        return node;
    }

    tree.append = function(_) {
        let node = historyTreeNode();
        node.state(_);
        node._id(count);
        count ++;
        if (root == null) {
            root = node;
        } else {
            node.father(tree.activeNode());
            tree.activeNode().addChild(node);
        }
        return tree;
    }

    tree.undo = function() {
        if (tree.activeNode() == null || tree.activeNode().father() == null) {
            console.log("You have nothing to undo.");
            return;
        }
        let current = tree.activeNode();
        let father = tree.activeNode().father();

        // put current node in the end.
        let index = father.activeIndex();
        father.children().splice(index,1);
        father.addChild(current);
        
        father.activeIndex(-1);
        return tree;
    }

    tree.redo = function() {
        if (tree.activeNode() == null || tree.activeNode().children().length == 0) {
            console.log("You have nothing to redo.");
            return;
        }
        let nextIndex = tree.activeNode().children().length - 1;
        tree.activeNode().activeIndex(nextIndex);
        return tree;
    }

    tree.reset = function() {
        if (tree.activeNode() == null) {
            console.log("You have nothing to reset.");
            return;
        }
        let node = tree.activeNode();
        while (node.father() != null) {
            node = node.father();
            node.activeIndex(-1);
        }
        return tree;
    }

    tree.revisit = function(_id) {
        tree.reset();
        let node = tree.find(_id);
        if (node == null) {
            console.log("Node doesn't exist.")
            return tree;
        }
        while (node.father() != null) {
            let index = node.father().children().indexOf(node);
            node.father().activeIndex(index);
            node = node.father();
        }
        return tree;
    }

    tree.find = function(_id) {
        let queue = [root];
        let node = null;
        while (queue.length != 0) {
            if (queue[0]._id() == _id) {
                node = queue[0];
                break;
            }
            queue.push(...queue[0].children());
            queue.splice(0,1);
        }
        return node;
    }

    tree.structure = function() {
        if (root == null) {
            console.log("no data");
            return null;
        } else {
            return root.structure();
        }
    }

    tree.path = function() {
        if (root == null) {
            console.log("no data");
            return [];
        } else {
            return root.path();
        }
    }

    tree.countPaths = function() {
        if (root == null) {
            console.log("no data");
            return 0;
        } else {
            return root.countLeaves();
        }
    }

    tree.maxDepth = function() {
        if (root == null) {
            console.log("no data");
            return 0;
        } else {
            return root.maxDepth();
        }
    }

    tree.export = function() {
        var structure = tree.structure();
        return JSON.stringify(structure);
    }

    return tree;
}

let historyTreeView = function() {
    let historyTreeView = {},
        tree = historyTree(),
        margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        nodeWidth = 65,
        nodeHeight = 30,
        nodeMargin = 10,
        container = null,
        svg = null;

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
        historyTreeView.render()
        return historyTreeView;
    }

    historyTreeView.undo = function() {
        tree.undo();
        historyTreeView.render()
        return historyTreeView;
    }

    historyTreeView.redo = function() {
        tree.redo();
        historyTreeView.render()
        return historyTreeView;
    }

    historyTreeView.reset = function() {
        tree.reset();
        historyTreeView.render()
        return historyTreeView;
    }

    historyTreeView.revisit = function(_id) {
        tree.revisit(_id);
        historyTreeView.render();
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
        var path = tree.path();
        var node = tree.activeNode();
        var y_offset = 10;
        var x_offset = 5;
        svg = container.append('svg')
            .style('position','absolute')
            .style('width', x_offset + tree.maxDepth() * (nodeWidth+nodeMargin))
            .style('height', y_offset + (tree.countPaths()+1) * (nodeHeight + nodeMargin))
            .style('z-index', -1);
        for (var i=0; i<tree.countPaths();i++) {
            historyTreeView.renderFrame(y_offset + i * (nodeHeight + nodeMargin));
        }
        if (node.children().length != 0) {
            historyTreeView.renderFrame(y_offset + tree.countPaths() * (nodeHeight + nodeMargin));
        }
        historyTreeView.renderPath(path, x_offset, y_offset);
        x_offset += (path.length - 1) * (nodeWidth+nodeMargin);
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
            if (i == path.length-1) {
                historyTreeView.addCurrentNodeView(path[i], (nodeWidth+nodeMargin)*i + x_offset, y_offset);
            } else {
                historyTreeView.addNodeView(path[i], (nodeWidth+nodeMargin)*i + x_offset, y_offset);
            }
        }
    }

    historyTreeView.addNodeView = function(d, x, y) {
        svg.append('line')
            .style('position','absolute')
            .attr("x1", x - 45)
            .attr("y1", y + 15)
            .attr("x2", x)
            .attr("y2", y + 15)
            .style("stroke", "#979797")
        container.append('div')
            .attr('id', 'history-node-' + d)
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
                .style('background-color','#F5A623');
                var node = tree.find(d);
                historyTreeView.displayHoverTip("id:"+d+"<br/>state:" + node.state());
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'white');
                historyTreeView.removeHoverTip(d);
            })
            .on('click', function () {
                historyTreeView.revisit(d);
            })
    }

    historyTreeView.addCurrentNodeView = function(d, x, y) {
        svg.append('line')
            .style('position','absolute')
            .attr("x1", x - 35)
            .attr("y1", y + 15)
            .attr("x2", x)
            .attr("y2", y + 15)
            .style("stroke", "#979797")
        container.append('div')
            .attr('id', 'history-node-' + d)
            .style('position','absolute')
            .style('left', x + "px")
            .style('top', y + "px")
            .style('width', 65 + "px")
            .style('height', 30 + "px")
            .style('background-color', 'white')
            .style('border', '2px solid #F5A623')
            .style('border-radius', '5px')
            .text(d)
            .on('mouseover', function() {
                d3.select(this)
                .style('background-color','#F5A623');
                var node = tree.find(d);
                historyTreeView.displayHoverTip("id:"+d+"<br/>state:" + node.state());
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'white');
                historyTreeView.removeHoverTip(d);
            })
    }

    historyTreeView.addInactiveNodeView = function(d, x, y) {
        var node = tree.find(d);
        svg.append('line')
            .style('position','absolute')
            .attr("x1", x - 35)
            .attr("y1", y + 15)
            .attr("x2", x)
            .attr("y2", y + 15)
            .style("stroke", "#979797")
        if (historyTreeView.path().includes(node.father()._id())) {
            svg.append('line')
                .style('position','absolute')
                .attr("x1", x - 35)
                .attr("y1", y + 15)
                .attr("x2", x - 35)
                .attr("y2", 15)
                .style("stroke", "#979797")
        } else if (node.father().children().length > 1) {
            var father_y = d3.select('#history-node-' + node.father()._id()).style('top');
            svg.append('line')
                .style('position','absolute')
                .attr("x1", x - 35)
                .attr("y1", y + 15)
                .attr("x2", x - 35)
                .attr("y2", father_y)
                .style("stroke", "#979797")
        }
        container.append('div')
            .attr('id', 'history-node-' + d)
            .style('position','absolute')
            .style('left', x + "px")
            .style('top', y + "px")
            .style('width', 65 + "px")
            .style('height', 30 + "px")
            .style('background-color', 'white')
            .style('border', '2px solid #979797')
            .style('border-radius', '5px')
            .text(d)
            .on('mouseover', function() {
                d3.select(this)
                .style('background-color','#F5A623')
                .style('border-color','#F5A623');
                historyTreeView.displayHoverTip("id:"+d+"<br/>state:" + node.state());
            })
            .on('mouseout', function () {
                d3.select(this)
                .style('background-color', 'white')
                .style('border-color','#979797');
                historyTreeView.removeHoverTip(d);
            })
            .on('click', function () {
                historyTreeView.revisit(d);
            })
    }

    historyTreeView.renderFrame = function(y) {
        var width = tree.maxDepth() * 75 + 5;
        container.append('div')
            .style('z-index', -2)
            .style('position','absolute')
            .style('left', "0px")
            .style('top', y-2 + "px")
            .style('width', width + "px")
            .style('height', 36 + "px")
            .style('background-color', 'white')
            .style('border', '1px solid #E9EFF4')
            .style('border-radius', '5px')
    }

    historyTreeView.displayHoverTip = function(str) {
        // hovertip
        let offset = d3.mouse(container.node());
        container.append("div")
            .attr("class", "hoverTip")
            .style("position", "absolute")
            .style("left", offset[0] + 30 + "px")
            .style("top", offset[1] + 10 + "px")
            .style("background", "white")
            .style("border-radius", "5px")
            .style("padding-left", "8px")
            .style("padding-right", "8px")
            .style("padding-top", "4px")
            .style("padding-bottom", "4px")
            .style("box-shadow", "2px 2px 2px 2px #DFDFDF")
            .style("color", "#646464")
            .style("font-size", "12px")
            .style("max-width", "200px")
            .html(str);
    }

    historyTreeView.removeHoverTip = function() {
        container.selectAll('.hoverTip').remove();
    }

    historyTreeView.export = function() {
        return tree.export();
    }

    return historyTreeView;
}