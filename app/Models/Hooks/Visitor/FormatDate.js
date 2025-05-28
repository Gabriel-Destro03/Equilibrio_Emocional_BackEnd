const FormatDateHooks = exports = module.exports = {}
const moment = use("moment");

FormatDateHooks.FormatDateHooks = async (instance) => {  
  instance.finishDate = moment(instance.finishDate).format("YYYY-MM-DD");
  instance.startDate = moment(instance.startDate).format("YYYY-MM-DD");
}
