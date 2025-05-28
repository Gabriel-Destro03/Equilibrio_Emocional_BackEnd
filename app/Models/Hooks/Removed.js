const RemovedHooks = exports = module.exports = {}
RemovedHooks.addColumnRemoved = async (instance) => {
  instance.removed = false;
}
