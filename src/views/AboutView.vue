<template>
  <div class="about-container">
    <!-- 背景图层 -->
    <div class="background-layer">
      <!-- 背景图片 - 使用内联样式直接引用 public 目录的图片 -->
      <div class="background-image" :style="{ backgroundImage: 'url(/img/background.png)' }"></div>
      <!-- 半透明遮罩层 -->
      <div class="background-overlay"></div>
    </div>

    <!-- 内容图层 -->
    <div class="content-layer">
      <div class="about-card">
        <h1 class="about-title">关于我们</h1>
        
        <div class="about-content">
          <section class="about-section">
            <h2>项目介绍</h2>
            <p>蓝湖医药管理系统是一个专业的药品进销存管理平台,旨在为药店、医疗机构提供高效、便捷的药品管理服务。</p>
          </section>

          <section class="about-section">
            <h2>核心功能</h2>
            <ul class="feature-list">
              <li>💊 <strong>药品库存管理</strong> - 入库、出库、库存查询</li>
              <li>💰 <strong>销售管理</strong> - 扫码销售、手动销售、销售记录</li>
              <li>📊 <strong>统计分析</strong> - 热销统计、销售统计、数据可视化</li>
              <li>👥 <strong>用户管理</strong> - 角色管理、权限控制、个人中心</li>
              <li>⚙️ <strong>系统设置</strong> - 库存设置、个人资料管理</li>
            </ul>
          </section>

          <section class="about-section">
            <h2>技术栈</h2>
            <div class="tech-tags">
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
              <span class="tech-tag">Element Plus</span>
              <span class="tech-tag">Vue Router</span>
              <span class="tech-tag">Vuex</span>
              <span class="tech-tag">ECharts</span>
              <span class="tech-tag">Axios</span>
              <span class="tech-tag">Spring Boot</span>
            </div>
          </section>

          <section class="about-section">
            <h2>项目说明</h2>
            <div class="info-box">
              <p>⚠️ 本项目暂不开源,仅供学习交流使用</p>
            </div>
          </section>

          <section class="about-section">
            <h2>相关链接</h2>
            <div class="links-container">
              <a href="https://github.com/pink-pigpig" target="_blank" rel="noopener" class="link-card">
                <span class="link-icon">📦</span>
                <span class="link-text">GitHub 主页</span>
              </a>
              <a href="https://pink-pigpig.github.io/pingpinghome/" target="_blank" rel="noopener" class="link-card">
                <span class="link-icon">📝</span>
                <span class="link-text">个人博客</span>
              </a>
            </div>
          </section>
        </div>

        <div class="about-footer">
          <router-link to="/" class="back-btn">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  // 背景图层
  .background-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      animation: backgroundZoom 20s ease-in-out infinite alternate;
    }

    .background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(0px);
      background: linear-gradient(135deg, rgba(66, 185, 131, 0.3) 0%, rgba(0, 181, 252, 0.3) 100%);
    }
  }

  // 内容图层
  .content-layer {
    position: relative;
    z-index: 1;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
  }

  // 关于卡片
  .about-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 50px 40px;
    max-width: 900px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 0.8s ease-out;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #42b983 0%, #00b5fc 100%);
      border-radius: 10px;

      &:hover {
        background: linear-gradient(135deg, #36a86f 0%, #0099d4 100%);
      }
    }
  }

  // 标题样式
  .about-title {
    font-size: 36px;
    font-weight: 700;
    text-align: center;
    margin: 0 0 40px 0;
    background: linear-gradient(135deg, #42b983 0%, #00b5fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  // 内容区域
  .about-content {
    .about-section {
      margin-bottom: 35px;

      h2 {
        font-size: 22px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 15px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #42b983;
      }

      p {
        font-size: 16px;
        line-height: 1.8;
        color: #606266;
        margin: 0;
      }

      // 特性列表
      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 10px 0;
          font-size: 15px;
          color: #606266;
          line-height: 1.6;
          border-bottom: 1px dashed #e0e0e0;

          &:last-child {
            border-bottom: none;
          }

          strong {
            color: #2c3e50;
          }
        }
      }

      // 技术标签
      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .tech-tag {
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(0, 181, 252, 0.1) 100%);
          border: 1px solid rgba(66, 185, 131, 0.3);
          border-radius: 20px;
          font-size: 14px;
          color: #42b983;
          font-weight: 500;
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #42b983 0%, #00b5fc 100%);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
          }
        }
      }

      // 信息框
      .info-box {
        padding: 20px;
        background: rgba(66, 185, 131, 0.1);
        border-left: 4px solid #42b983;
        border-radius: 8px;

        p {
          margin: 0;
          color: #42b983;
          font-weight: 500;
        }
      }

      // 链接容器
      .links-container {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;

        .link-card {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid #42b983;
          border-radius: 12px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;

          .link-icon {
            font-size: 28px;
          }

          .link-text {
            font-size: 16px;
            font-weight: 500;
            color: #42b983;
          }

          &:hover {
            background: linear-gradient(135deg, #42b983 0%, #00b5fc 100%);
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);

            .link-text {
              color: #ffffff;
            }
          }
        }
      }
    }
  }

  // 底部按钮
  .about-footer {
    margin-top: 40px;
    text-align: center;

    .back-btn {
      display: inline-block;
      padding: 12px 40px;
      background: linear-gradient(135deg, #42b983 0%, #36a86f 100%);
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 50px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(66, 185, 131, 0.6);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// 背景缩放动画
@keyframes backgroundZoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

// 淡入向上动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .about-card {
    padding: 30px 20px !important;
    max-height: 90vh !important;
  }

  .about-title {
    font-size: 28px !important;
    margin-bottom: 30px !important;
  }

  .about-section h2 {
    font-size: 20px !important;
  }

  .links-container {
    flex-direction: column !important;
    
    .link-card {
      min-width: 100% !important;
    }
  }
}
</style>