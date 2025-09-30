<template>
  <div class="home">
    <svg t="1758543346811" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7638" width="200" height="200">
      <path d="M512.6 959.7h-1C392.8 959.7 128 773.2 128 545.3v-307C215 216 392.8 64 511.2 63.9h0.2c118.3 0 296 152.1 384.7 174.4v307c0.1 227.9-266.3 414.4-383.5 414.4z" fill="#694B4B" p-id="7639">

      </path>
      <path d="M512.5 886.1h-0.8c-99.3 0-320.6-155.9-320.6-346.4v-249c72.7-18.7 221.3-153.1 320.3-153.2h0.2c98.8 0 247.4 134.6 321.5 153.2v249.1c0 190.5-222.7 346.3-320.6 346.3z" fill="#00B5FC" p-id="7640">
      </path>
      <path d="M511.7 195.2h-0.2c-83.7 0.1-209.3 113.8-270.8 129.5V512h271.4V195.3c-0.1 0-0.3-0.1-0.4-0.1zM512.1 512.1v316.2h0.4c82.8 0 271-131.8 271-292.9v-23.3H512.1z" fill="#FFFFFF" p-id="7641">
      </path>
    </svg>
  </div>
  <h1>欢迎来到蓝湖医药管理系统</h1>
  <h3>你可以点击下面的绿色文字跳转相关页面</h3>

      <nav>
        <router-link to="/login">开始登录</router-link> 
      </nav>
    
    <h3>项目暂不开源</h3>
    <ul>
      <li><a href="https://github.com/pink-pigpig" target="_blank" rel="noopener">我的gitHub</a></li>
      <br>
      <a href="https://pink-pigpig.github.io/pingpinghome/" target="_blank" rel="noopener">我的博客</a>

      <nav>
        <router-link to="/about">关于我们</router-link> 
      </nav>
     
     
    </ul>
 
</template>


<script lang="ts"> 
</script>
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
