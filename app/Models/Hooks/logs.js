const Log = use('App/Models/Log')


const logHook = exports = module.exports = {}
let log = {}
logHook.logCreateOrUpdate = async (instance) => {

  log = {
    ...log,
    removed: false,
    nameCollection: Object.getPrototypeOf(instance).constructor.name
  }

  if (instance.condominiumId) {
    log = {
      ...log,
      condominiumId: instance.condominiumId
    }
  }

  if (instance['$attributes'].removed) {
    log = {
      ...log,
      oldValue: instance['$originalAttributes'],
      newValue: {},
    }
  } else {
    log = {
      ...log,
      oldValue: instance['$originalAttributes'],
      newValue: instance['$attributes'],
    }
  }

  await Log.create(log)
}