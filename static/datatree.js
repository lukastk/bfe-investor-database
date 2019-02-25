sectors_children = {};
countries_children = {};

sectors_all = []
countries_all = []

var find_children = function(node, parents, children) {
  for (var nk in node) {

    for (var i = 0; i < parents.length; i++) {
      children[parents[i]].push(nk)
    }

    nd = node[nk];
    children[nk] = [];
    parents2 = parents.slice();
    parents2.push(nk);
    find_children(nd, parents2, children)
  }
}

var find_all_elements = function(node, elemlist) {
  for (var nk in node) {
    elemlist.push(nk)
    find_all_elements(node[nk], elemlist)
  }
}

find_children(sectors_tree, [], sectors_children);
find_children(countries_tree, [], countries_children);

find_all_elements(sectors_tree, sectors_all);
find_all_elements(countries_tree, countries_all);
