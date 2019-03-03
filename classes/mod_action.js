const db = require("../utilities/db").db

exports.modules = class _case{
    constructor(number){
    return (async ()=>{
    this.user = await getDetails(number,'user')    
    this.mod = await getDetails(number,'mod')    
    this.type = await getDetails(number,'type')
    this.points = await getDetails(number,'points')
    this.duration = await getDetails(number,'duration')
    this.date = await getDetails(number,'date')
    return this
    })();
    }
   async getDetails(number,type){
       const data = await db.hget("case_" + number.toString(),type);
       return data
   }
}
