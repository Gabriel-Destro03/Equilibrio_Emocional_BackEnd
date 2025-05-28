const FormatDateHooks = exports = module.exports = {}
const moment = use("moment");

FormatDateHooks.FormatDateHooks = async (instance) => {  
  instance.mandateStart = moment(instance.mandateStart).format("YYYY-MM-DD");
  instance.mandateFinish = moment(instance.mandateFinish).format("YYYY-MM-DD");
  instance.electionDate = moment(instance.electionDate).format("YYYY-MM-DD");
}
