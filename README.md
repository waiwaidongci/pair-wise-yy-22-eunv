# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 归档与版本留查

- 方案从编制到归档期间，步骤、材料名称和影像版本可随时补录或更正；未归档方案重新打开时始终跟随最新来源数据。
- 归档时生成**当时的完整修复档案**（`RestorationArchive`）：方案方法、风险说明、全部步骤和对应影像版本整体快照，归档后不再随来源变化。
- 来源记录后续发生补录/更正时，档案仍按生成时内容显示，方案页仅列出**待复核差异**（`GET /api/restoration-archive/plan/:planId/diff`）。
- 已归档方案需**另存新版本**（`POST /api/restoration-archive/reopen`）才能继续修复，再次归档生成 `archive_no + 1` 的新档案，旧档案按版本留查。

归档相关接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/restoration-archive/plan/:planId` | 某方案的全部档案版本（按版本倒序） |
| GET | `/api/restoration-archive/plan/:planId/diff` | 最新档案与当前来源的待复核差异 |
| GET | `/api/restoration-archive/:id` | 单个档案快照详情 |
| POST | `/api/restoration-archive` | 归档，生成当时完整快照 |
| POST | `/api/restoration-archive/reopen` | 已归档方案另存新版本继续修复 |

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用；归档动作会把方案置为 `ARCHIVED`。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- RestorationArchive（归档实体）: models/RestorationArchive、types/RestorationArchivePayload（含 ArchiveDiffEntry）、constructors/RestorationArchiveDtoFactory（快照构造）、constants/logTemplates（归档/另存新版本/差异复核/导出）、constants/errorCodes + errorMessages（PLAN_NOT_FOUND、PLAN_ALREADY_ARCHIVED、PLAN_NOT_ARCHIVED、ARCHIVE_NOT_FOUND）、repositories/services/controllers/routes、前端 api/stores/constructors、components/common/ArchiveDiffList 与 ArchiveSnapshotCard、pages/PlansPage 均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
