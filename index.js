// 通过require函数导入了Express.js模块
const express = require('express')
const cors = require('cors')
require('dotenv').config()
// console.log('loaded env variables.')
const Note = require('./models/note')
// 创建了一个Express应用程序实例
const app = express()
// 中间件是可以用来处理 request 和 response 对象的函数
// 使用 express.json() 中间件(as a json-parser语义解析器)来解析请求体中的 JSON 数据，解析后的 JSON 数据将会被添加到请求对象的 body 属性中
// 这对于处理 POST、PUT 和 PATCH 请求等需要从请求体中提取数据的情况非常有用!
app.use(express.json())// 使用中间件
app.use(cors())
app.use(express.static('build'))//连接前端build包。每当express收到一个HTTP GET请求时，它将首先检查build目录中是否包含一个与请求地址相对应的文件。如果找到了正确的文件，express将返回它

const requestLogger = (request, response, next) => {
  console.log('-----request logger------')
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', JSON.stringify(request.body))
  console.log('---')
  next()
}

app.use(requestLogger)

let notes = [
    {
        id: 1,
        content: "HTML is kind of easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
      },
      {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
      },
      {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
      }
]




/* const generateId = () => {
  const maxID = notes.length >0 ?
  Math.max(...notes.map(note => {return note.id}))
  : 0
  return maxID +1
} */
app.get('/', (request, response) => {
  // respond with data if BUILD(compressed files of frontend) doesn't have corresponding file
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  // 回应硬编码的notes
  // response.json(notes)

  // 改为从MongoDB的Note集合取数据
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) =>{
/*   const id = Number(request.params.id) //字符串转成数字
  const note = notes.find(note => {
    return(note.id === id)})
    if(note) {
      response.json(note)
    }else{
      // .end():quickly end the response without any data
      response.status(404).end()
    } */
    Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        console.log('not founded.')
        response.status(404).end();
      }
    })
    .catch(error => {
      response.status(500).json(error);
    });
  
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  // 实现删除=保留ID不等于传入ID的所有笔记
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const body = request.body
  if (!body.content){
    return response.status(400).json({error: 'content missing'})
  }
/*   const note = {
    content: body.content,
    date: new Date().toISOString(),
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note) */

  // 用Note构造函数创建
  const note = new Note({
    content: body.content,
    important:body.important || false,
    date: new Date()
  })
  note.save().then(savedNote => {
    response.json(savedNote) //响应中送回的数据用toJSON方法创建的格式化版本。
    console.log('note saved!')
  })

})

app.put('/api/notes/:id',(request, response) => {
  const id = Number(request.params.id)
  // 找到要改变那个笔记
  const note = notes.find(note => note.id === id) //对象是通过引用传递的。这意味着当你修改 noteToUpdate 对象时，实际上是修改了 notes 数组中相应对象的属性。这种修改是原地的
  const updatedNote = request.body
  if (note) { //如果从数据库找到了
    note.content = updatedNote.content
    note.important = updatedNote.important
    response.json(note)
  }else{
    response.status(404).end()
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// 使用环境变量(by heroku)端口或本地端口
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


