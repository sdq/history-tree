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
        //console.log(node.state());
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

    return tree;
}