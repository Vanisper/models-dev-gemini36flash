# Models.dev 模型目录查看器 (Model Catalog Explorer)

基于 [models.dev](https://models.dev) 三份公开数据构建的现代化大模型（LLM）目录查看与分析系统。系统采用 **pnpm monorepo** 架构，提供 NestJS REST API 服务与 React (TanStack Stack + Tailwind CSS) 前端页面。

---

## 🌟 核心视图与亮点功能

1. **模型总表 + 详情 (Model Catalog & Detail)**
   - 全量收录 260+ 大模型，支持表格模式 (Table View) 与卡片网格模式 (Grid View) 切换。
   - 多维度实时搜索与组合筛选：按名称/ID/Lab、模态 (Text/Image/Video/PDF)、能力 (Reasoning/Tool Call/开源权重)、Context 窗口大小、Input/Output 价格。
   - 支持多列排序：发布日期、模型名称、Context 上下文长度、输入价格、Benchmark 数量等。
   - **模型详情抽屉Modal**：全面展示能力特性、Knowledge Cutoff、模态支持、Context/Output 限制条形图、所有 API Provider 分渠道定价表、开源权重下载链接及 Benchmark 得分条形图。

2. **价格对比与用量开销估算器 (Pricing & Token Cost Calculator)**
   - **Token Cost Calculator**：输入预期月度用量（Input / Output / Cache Read 百万 Tokens），实时计算 260+ 模型的预期月开销。
   - **多 Provider 差价对比**：自动聚合如 Claude 3.5 / Llama 3.3 / GPT-4o 等在不同托管厂商（OpenAI, Bedrock, Vertex AI, Together AI, Fireworks 等）的各渠道报价对比。

3. **Benchmark 综合对比 (Benchmark Matrix & Leaderboard)**
   - **Side-by-Side 矩阵**：支持自由选择最多 6 款模型进行侧向 side-by-side Benchmark 成绩对比，高亮单项冠军 👑。
   - **分类排行榜**：按 MMLU-Pro、HumanEval、GPQA、MATH、SWE-bench 等 60+ Benchmark 测试集筛选最高得分模型。

4. **Lab 视角 (Lab Overview)**
   - 聚合全球 24 家 AI 实验室（OpenAI, Anthropic, Google, DeepSeek, Meta, Alibaba Qwen, MiniMax, Moonshot AI, xAI, Mistral 等）。
   - 展示 Lab 简介、托管 Provider 数、开源模型数及旗下模型全景。

---

## 🛠️ 技术栈与工程规范

- **包管理**: `pnpm` (Workspace Monorepo)
- **后端 (API Server)**: NestJS (TypeScript, RESTful API)
- **前端 (SPA)**: React 18, Vite, TanStack Query, Tailwind CSS, Lucide Icons
- **编辑器友好**: 根目录统一 `tsconfig.json` 与 `.vscode/settings.json`

---

## 🚀 本地开发与运行 (Local Development)

### 1. 安装依赖
```bash
pnpm install
```

### 2. 命令行数据下载与更新 (Download CLI Script)
运行独立脚本，抓取并整合 `models.dev/catalog.json`、`models.dev/api.json` 与 `models.dev/labs` 数据并保存至本地缓存：
```bash
pnpm run update-data
```

### 3. 启动开发模式 (Dev Mode)
同时启动后端 REST API (端口 3001) 与前端 Vite SPA (端口 3000)：
```bash
pnpm dev
```
访问前端页面：`http://localhost:3000`

### 4. 项目构建与生产启动
```bash
# 全局构建前端与后端
pnpm build

# 启动后端 (自动托管前端静态文件)
pnpm start
```

---

## 🔄 数据更新机制 (Data Refresh Strategy)

本系统设计了**双轨数据更新机制**：

1. **CLI 离线/构建脚本 (`pnpm run update-data`)**：
   - 可以在本地、CI/CD 管道或构建阶段运行，拉取 `models.dev` 最新 JSON/HTML 并合成本地缓存文件。
2. **运行中热刷新 API (`POST /api/refresh`)**：
   - 系统提供 `POST /api/refresh` 接口。在应用运行中点击前端导航栏“**热刷新**”按钮或通过 HTTP 请求调用，后端服务即刻在线抓取 `models.dev` 三份数据并在内存中热重载，无需重启服务。

---

## 🐳 Docker 单容器部署 (Docker Deployment)

系统提供多阶段构建的多平台 `Dockerfile` 与 `docker-compose.yml`，实现前端 SPA 静态托管与 NestJS REST API 的单容器一键部署：

### 方式一：Docker Compose 启动
```bash
docker compose up --build -d
```

### 方式二：手动构建 Docker 镜像
```bash
docker build -t models-catalog-viewer .
docker run -d -p 3000:3000 --name models-catalog models-catalog-viewer
```
访问：`http://localhost:3000`

---

## ☁️ Vercel 部署与"数据更新"实现说明

本仓库包含 `vercel.json` 配置文件及 Serverless 适配入口 `api/index.ts`，兼容 Vercel 部署（前端静态托管 + NestJS API Serverless Function）。

### Vercel 环境下“数据更新”的实现说明：
1. **构建期数据写入 (Build Time Sampling)**：
   - 在 `vercel.json` 中配置 `buildCommand: "pnpm run update-data && pnpm run build"`。在每次部署或触发重新构建时，自动拉取 `models.dev` 最新数据并打包入 Serverless bundle。
2. **运行时在线热重载 (`POST /api/refresh`)**：
   - 处于 Serverless 环境下时，`POST /api/refresh` 接口会实时向 `models.dev` 发起 Fetch 请求，并将最新的 260+ 模型及 Lab 数据热更新至 Serverless Function 实例内存中。
3. **自动化持续更新方案**：
   - **Vercel Cron Jobs**：可在 Vercel 中配置定时任务（Cron），定期请求 `/api/refresh` 或调用 Vercel Deploy Hook 触发重建。
   - **KV / Redis 扩展**：生产可进一步接驳 Vercel KV (Upstash Redis)，热刷新时写至 Redis 共享缓存，全区域 Serverless 节点均可毫秒级同步最新模型数据。

---

## 📡 REST API 接口文档

| HTTP 方法 | 接口路径 | 说明 |
|---|---|---|
| `GET` | `/api/summary` | 获取数据概览（模型总数、Lab数、Provider数、开元模型数等） |
| `GET` | `/api/models` | 获取模型列表（支持 `search`, `lab`, `modality`, `reasoning`, `toolCall`, `openWeights`, `minContext`, `sortBy`, `sortOrder` 等查询参数） |
| `GET` | `/api/models/:id` | 获取单模型完整详情（例如 `/api/models/openai/gpt-4o`） |
| `GET` | `/api/labs` | 获取 24 家 AI 实验室列表 |
| `GET` | `/api/labs/:id` | 获取特定实验室详情 |
| `GET` | `/api/benchmarks` | 获取 Benchmark 指标列表与顶部模型 |
| `POST` | `/api/refresh` | 触发在线热刷新 |

---

## ✅ 验证结果 (Self-Verification)

- **数据合并完整度**: 成功解析 262 款大模型规格、24 家 Lab 简介及 64 项 Benchmark 分数。
- **构建测试**: `pnpm build` 无 TypeScript / Vite 编译报错。
- **接口测试**: 测试了 `/api/summary`、`/api/models`、`/api/models/openai/gpt-5`、`/api/labs`、`/api/benchmarks` 和 `POST /api/refresh`，全部正确返回 200 OK。
