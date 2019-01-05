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
        container = d3.select(_);
        svg = container.append("svg")
                    .attr("width", width + margin.right + margin.left)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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

    historyTreeView.render = function(data) {

        var treeData = JSON.parse(data);
        let root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 60});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var i = 0;
        var node = svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + root.y0 + "," + root.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style('stroke', 'steelblue')
            .style('stroke-width', '3px')
            .style("fill", function(d) {
                console.log(d);
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", 2)
            .attr("x", -3)
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.id; })
            .style("font", "12px sans-serif");

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            //.duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            //.duration(duration)
            .attr("transform", function(d) {
                return "translate(" + root.y + "," + root.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: root.x0, y: root.y0}
                return diagonal(o, o)
            })
            .style("fill", "none")
            .style("stroke", "#ccc")
            .style("stroke-width", "2px");

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            //.duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`

            return path
        }

        function click(d) {
            console.log(d);
        }
    }

    return historyTreeView;
}