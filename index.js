// 通过require函数导入了Express.js模块
const express = require('express')
const cors = require('cors')
// 创建了一个Express应用程序实例
const app = express()
// 中间件是可以用来处理 request 和 response 对象的函数
// 使用 express.json() 中间件(as a json-parser语义解析器)来解析请求体中的 JSON 数据，解析后的 JSON 数据将会被添加到请求对象的 body 属性中
// 这对于处理 POST、PUT 和 PATCH 请求等需要从请求体中提取数据的情况非常有用!
app.use(express.json())// 使用中间件
app.use(cors())

const requestLogger = (request, response, next) => {
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

const generateId = () => {
  const maxID = notes.length >0 ?
  Math.max(...notes.map(note => {return note.id}))
  : 0
  return maxID +1
}
app.get('/', (request, response) => {
  // respond with data
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  // respond with data
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) =>{
  const id = Number(request.params.id) //字符串转成数字
  const note = notes.find(note => {
    return(note.id === id)})
    if(note) {
      response.json(note)
    }else{
      // .end():quickly end the response without any data
      response.status(404).end()
    }
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
  const note = {
    content: body.content,
    date: new Date().toISOString(),
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note)

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})