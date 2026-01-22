export const uuid = /*#__PURE__*/ (() => {
  let id = 0;
  return () => {
    id++;
    return id.toString(36);
  };
})();
