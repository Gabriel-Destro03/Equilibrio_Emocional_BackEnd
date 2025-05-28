const StatusHooks = exports = module.exports = {}
StatusHooks.addColumnStatus = async (instance) => {  
  instance.status = 'Pendente';
}
