# ChatGPT-Web

- 这是一个基于OpenAI ChatGPT3.5 模型API的前端项目，可进行私有化部署
- 本人的前端不是很好，全凭兴趣写的项目😀

## 项目功能

- 基本问答界面
- 多会话和上下文逻辑
    - 新增/删除会话
    - 导入/导出会话
- 问答使用卡片展示💥
    - 渲染 (markdown支持数学公式、代码高亮、图片、emoji表情)
    - 折叠 (可折叠回答，减少翻页滚动)
    - 跳过 (跳过其中部分问题/回答,即让模型丢失部分知识)
    - 编辑 (编辑问题/回答)
    - 重发 (重发问题/回答)
    - 删除 (删除问题/回答)
    - 拖拽 (可交换问答的顺序)
- 可前端设置OPENAI_API_KEY
- 响应式、支持移动端

![公式代码渲染](./imgs/a.png)
![图像渲染](./imgs/b.png)
![修改折叠跳过](./imgs/c.png)
![修改结果](./imgs/d.png)
![会话面板](./imgs/e.png)
![移动设备](./imgs/f.png)

## 快速开始

### · 本地部署
- 安装依赖、打包
```sh
npm install
npm run build
```

- 进入打包好的文件夹`\dist`
```sh
python -m http.server
或者
python3 -m http.server
````

在浏览器打开`http://127.0.0.1:8000/`即可

- 你也可以直接启动项目
```sh
npm install
npm run dev
```
## 代理

- 因为默认是使用OpenAI官网的API，所以需要开代理，相关配置在`env.js`文件里  
- `proxy`参考axios的代理配置写法

## 上下文会话是怎么实现的？

- 请求的时候会将历史会话记录全部传给ChatGPT，从而实现上下文会话功能，所以长会话会消耗许多token。此外由于官方限制了token大小，所以超过限制的token大小的会话会直接截断，导致在长对话中模型遗忘之前的知识，请注意。
- 你可以删除或者跳过一些不重要或会影响模型回答的信息来更好的使用ChatGPT。


## 其他

- 因为是前端直接使用axios请求API，所以会暴露`OPENAI_API_KEY`，请注意自己的`OPENAI_API_KEY`的安全
- 如果想不暴露`OPENAI_API_KEY`可以自己增加后端，在`env.js`文件里修改`apiURL`,`OPENAI_API_KEY`使用自己的JWT验证即可。前端请求参数和官网格式基本一致。