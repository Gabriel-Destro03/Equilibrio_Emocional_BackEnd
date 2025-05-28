const counters = use('App/Models/Counters')

const counterHook = exports = module.exports = {}

counterHook.getNextSeq = async (instance) => {
  const year = new Date()

  const name = Object.getPrototypeOf(instance).constructor.name;

  const nextItem = await counters.where({code : name,condominiumId:instance.condominiumId}).first();

  const update = new Date(nextItem.updated_at);


  if(year.getUTCFullYear() > update.getUTCFullYear()){
    nextItem.seq = 1;
  }else{
    nextItem.seq = nextItem.seq + 1;
  }

  

  const result = await nextItem.save(nextItem);



  instance.seq = `${nextItem.seq}-${year.getUTCFullYear()}`;
}
