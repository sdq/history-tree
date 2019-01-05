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
        let nodeJson = "";
        nodeJson += "{\"id\":\"" + _id + "\",";
        nodeJson += "\"state\":\"" + state + "\",";
        if (father != null) {
            nodeJson += "\"father\":\"" + father._id() + "\",";
        }
        nodeJson += "\"active\":\"" + activeIndex + "\",";
        nodeJson += "\"children\":[";
        let childrenJson = "";
        for (var i in children) {
            childrenJson += children[i].structure() + ",";
        }
        if (childrenJson.length > 0) {
            childrenJson = childrenJson.slice(0,-1);
        }
        nodeJson += childrenJson;
        nodeJson += "]}";
        return nodeJson;
    }

    node.path = function() {
        let path = []
        path.push({
            "id": _id,
            "state": state
        })

        if (activeIndex != -1) {
            path = path.concat(children[activeIndex].path())
        }

        return path;
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
        if (tree.activeNode().father() == null) {
            console.log("You cannot undo.");
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
        if (tree.activeNode().children().length == 0) {
            console.log("You have nothing to redo.");
            return;
        }
        let nextIndex = tree.activeNode().children().length - 1;
        tree.activeNode().activeIndex(nextIndex);
        return tree;
    }

    tree.reset = function() {
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

    return tree;
}