const mongoose = require('mongoose')
const url = process.env.MONGODB_URL
console.log('connecting to', url)

mongoose.connect(url).then(result => {
    console.log('connected to MongoDB')
})
.catch(error => {
    console.log('error connecting to MongoDB: ', error.message)
})

const noteSchema = new mongoose.Schema({
  content:{
    type: String,
    // minLength和required验证器是内置的
    minLength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean
})

// response.json(xxx)这个将响应转成json格式的函数会自动调用以下toJSON
// 自定义响应的格式
noteSchema.set('toJSON', {
  transform: (document, returnedObj) => { //document是数据库的一行，returnedObj是想返回给用户的响应。
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  }
})
// 模块的公共接口
module.exports = mongoose.model('Note', noteSchema)  // 设为Note模型