/**
 * Builds a hierarchical tree structure from a flat array of blocks
 * Time Complexity: O(N) using a Hash Map
 *
 * @param {Array<Object>} blocks - Flat list of blocks from the database
 * @returns {Array<Object>} - Nested tree structure with children arrays
 */
const buildBlockTree = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return [];
  }

  const map = new Map();
  const roots = [];

  // Step 1: Initialize map entry for every block with an empty children array
  blocks.forEach((block) => {
    // Clone block object so we do not mutate the raw database object
    map.set(block.id, {
      ...block,
      children: [],
    });
  });

  // Step 2: Link children to their respective parent nodes
  blocks.forEach((block) => {
    const node = map.get(block.id);
    if (block.parent_id && map.has(block.parent_id)) {
      const parentNode = map.get(block.parent_id);
      parentNode.children.push(node);
    } else {
      // If parent_id is null (or refers to a parent not in the current set), treat as root
      roots.push(node);
    }
  });

  return roots;
};

module.exports = {
  buildBlockTree,
};
