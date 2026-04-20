<template>
  <div class="home-container">
    <!-- 背景图层 -->
    <div class="background-layer">
      <!-- 动态粒子效果背景 -->
      <div class="particles-bg">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
      <!-- 渐变遮罩层 -->
      <div class="gradient-overlay"></div>
    </div>

    <!-- 内容图层 -->
    <div class="content-layer">
      <div class="welcome-card">
        <!-- Logo 和标题区域 -->
        <div class="header-section">
          <svg t="1758543346811" class="logo-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7638" width="120" height="120">
            <path d="M512.6 959.7h-1C392.8 959.7 128 773.2 128 545.3v-307C215 216 392.8 64 511.2 63.9h0.2c118.3 0 296 152.1 384.7 174.4v307c0.1 227.9-266.3 414.4-383.5 414.4z" fill="#694B4B" p-id="7639">
            </path>
            <path d="M512.5 886.1h-0.8c-99.3 0-320.6-155.9-320.6-346.4v-249c72.7-18.7 221.3-153.1 320.3-153.2h0.2c98.8 0 247.4 134.6 321.5 153.2v249.1c0 190.5-222.7 346.3-320.6 346.3z" fill="#00B5FC" p-id="7640">
            </path>
            <path d="M511.7 195.2h-0.2c-83.7 0.1-209.3 113.8-270.8 129.5V512h271.4V195.3c-0.1 0-0.3-0.1-0.4-0.1zM512.1 512.1v316.2h0.4c82.8 0 271-131.8 271-292.9v-23.3H512.1z" fill="#FFFFFF" p-id="7641">
            </path>
          </svg>
          <h1 class="welcome-title">蓝湖智药管理系统</h1>
          <p class="welcome-subtitle">数字化药房管理解决方案 · 让药品管理更智能</p>
        </div>

        <!-- 系统介绍卡片 -->
        <div class="intro-section">
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">📦</div>
              <h3>库存管理</h3>
              <p>智能化入库出库流程，实时监控库存状态，有效期预警提醒</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💊</div>
              <h3>销售管理</h3>
              <p>扫码快速销售，多种支付方式，完整的订单追踪记录</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <h3>数据分析</h3>
              <p>多维度销售统计，热销商品排行，可视化数据报表</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔐</div>
              <h3>权限管理</h3>
              <p>精细化角色权限控制，保障数据安全与操作规范</p>
            </div>
          </div>
        </div>

        <!-- 核心价值展示 -->
        <div class="value-section">
          <div class="value-item">
            <span class="value-number">90%</span>
            <span class="value-label">效率提升</span>
          </div>
          <div class="divider"></div>
          <div class="value-item">
            <span class="value-number">100%</span>
            <span class="value-label">数据准确</span>
          </div>
          <div class="divider"></div>
          <div class="value-item">
            <span class="value-number">24/7</span>
            <span class="value-label">实时监控</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <router-link to="/login" class="primary-btn">
            <span class="btn-text">立即体验</span>
            <span class="btn-arrow">→</span>
          </router-link>
          <router-link to="/about" class="secondary-btn">了解更多</router-link>
        </div>

        <!-- 底部信息 -->
        <div class="footer-info">
          <p class="version-text">Version 1.0.0</p>
          <div class="social-links">
            <a href="https://github.com/pink-pigpig" target="_blank" rel="noopener" class="social-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <span class="separator">|</span>
            <a href="https://pink-pigpig.github.io/pingpinghome/" target="_blank" rel="noopener" class="social-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              博客
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  setup() {
    // 生成粒子样式
    const getParticleStyle = (index: number) => {
      const size = Math.random() * 6 + 2
      const left = Math.random() * 100
      const delay = Math.random() * 5
      const duration = Math.random() * 10 + 10
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    }

    return {
      getParticleStyle
    }
  }
})
</script>

<style scoped lang="scss">
.home-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

// 背景图层
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

// 内容图层
.content-layer {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

// 欢迎卡片
.welcome-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 50px 60px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 头部区域
.header-section {
  margin-bottom: 40px;
}

.logo-icon {
  margin-bottom: 20px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.15) rotate(10deg);
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.3));
  }
}

.welcome-title {
  font-size: 36px;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
  letter-spacing: 1px;
}

// 功能特性网格
.intro-section {
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(102, 126, 234, 0.1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
  }
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 12px;
  display: block;
}

.feature-item h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.feature-item p {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

// 核心价值展示
.value-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.value-number {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.value-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
  letter-spacing: 1px;
}

.divider {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, transparent, rgba(102, 126, 234, 0.3), transparent);
}

// 操作按钮区域
.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(-1px);
  }
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.primary-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.secondary-btn {
  display: inline-block;
  padding: 16px 32px;
  color: #667eea;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #667eea;
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
}

// 底部信息
.footer-info {
  padding-top: 20px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.version-text {
  font-size: 13px;
  color: #95a5a6;
  margin: 0 0 12px 0;
}

.social-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7f8c8d;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
    transform: translateY(-2px);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.2);
  }
}

.separator {
  color: #bdc3c7;
  font-size: 14px;
}

// 响应式设计
@media (max-width: 768px) {
  .welcome-card {
    padding: 40px 30px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .value-section {
    gap: 20px;
    padding: 20px;
  }

  .value-number {
    font-size: 28px;
  }

  .action-section {
    flex-direction: column;
    gap: 12px;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .value-section {
    flex-direction: column;
    gap: 16px;
  }

  .divider {
    width: 50px;
    height: 1px;
  }
}
</style>
