## Unreleased — Phase A–F review (2026-09-30)

## 5.0.0

### Minor Changes

- f0e9278: Close the second Phase A–F review: strict security config validation and environment resolution, explicit metrics trust, default WS Origin checks, hard-link-safe CLI writes and delimited tool arguments, DTO transformation and conservative schema diagnostics, privacy-safe telemetry, HTTP3 peer ownership and draining reference SSE service. MCP/LLM/Guard first-release major entries are in phase-f-audit-hardening. See docs/migration/phase-a-f-review-fixes.md. Do not treat local tests as release/client/provider acceptance.
- a9e91a9: Repair Phase F audit boundaries: HTTP connection ownership and authentication, cancellation, atomic token reservations, allowlisted streaming tool execution, single-use durable approval decisions, privacy-safe audit/capture, live GenAI spans and shared DTO schema rules. See docs/migration/phase-f-audit-fixes.md for stricter store/auth contracts. This changeset has not been applied or published.
- f0e9278: Phase F (F-1) — `koatty_mcp@1.0.0`：新增 MCP Server 宿主包，把 `@Service` 方法以 `@Tool` / `@Resource` / `@Prompt` 声明式暴露为 MCP 工具、资源与提示词，复用既有 IoC、`koatty_validation` 白名单校验、请求作用域与可观测性。附带两项增量改动：`koatty_validation` 新增 `PARAM_DTO_KEY`（`@Validated({ types })` 的 DTO 类型桥接元数据，`PARAM_CHECK_KEY` 语义不变）；`koatty_core` 的 `KoattyContext` 新增可选协议字段（`principal`、`mcpSessionId`、`mcpRequestId`、`mcpToolName`、`signal`、`progress`），非 MCP 请求不受影响。

  `koatty_mcp@1.0.0` 为首次发布，目标版本由 changeset major 从 0.0.0 统一生成，不直接写入 `packages/koatty-mcp/package.json`，必须通过 changeset 统一生成版本。迁移说明见 `docs/migration/phase-f-mcp-host.md`。

  ***

  Phase F (F-2) — `koatty_llm@1.0.0`：新增 LLM 调用抽象包（厂商适配、路由与 fallback、超时/退避/熔断、共享预算、`signal` 取消、结构化输出、进程内工具循环、非流式精确缓存与成本估算），与 F-1 的 `ctx.signal`、MCP 工具 schema 衔接。该包为首次发布，目标版本由 changeset major 从 0.0.0 统一生成，不直接写入 `packages/koatty-llm/package.json`，必须通过 changeset 统一生成版本；本次未改动任何既有包的行为。迁移说明见 `docs/migration/phase-f-llm-client.md`。

### Patch Changes

- f0e9278: Phase A–D 审计修复，未发布：

  - 容器注册表、类标识、实例注入与 AOP 解析均按容器隔离；注入不再写入共享原型。同名构造函数的元数据缓存不再串用。
  - `app.container` 与 Core ALS 贯通；请求结束释放对应容器的请求实例。组件实例和事件处理器使用所属应用。
  - 注册期构造路由 handler；控制器、参数元数据、中间件和 RouterFactory 使用应用容器。关闭一个应用不会清理另一应用的路由。
  - 扫描目录、每个模块与缓存条目均以 realpath 校验根目录边界；越界路径直接拒绝，不再回退扫描整个项目。
  - Bootstrap 自动创建应用独立容器，Loader/Router/注入链路使用 app.container；扫描同时处理默认导出与具名导出。
  - SSE 复用普通路由和 streamSSE；现有 middleware 与 Around/run 承担鉴权、限流和方法包装。
  - HTTPS/HTTP2 证书热更新及失败回退。
  - Serve 使用连接追踪器，HTTP/3 移至独立实验包 koatty_http3；移除核心 QUIC 依赖及模拟监听。
  - 生产构建可用既有 manifest 命令生成 runtime 清单；启动前逐文件校验路径与 SHA256。
  - 修复独立安装缺失运行时/公开类型依赖，以及原生 Node ESM 入口加载错误。
  - Config 复用既有双模式装饰器适配器，支持 TC39 字段初始化与应用隔离。

  移除 Http3Server 等核心导出和入站池语义属于破坏性变更，因此 koatty 与 koatty_serve 必须按 major 发布，不能沿用原计划的 4.5.0 minor。koatty_http3 是首次发布包，按发布工具的新包流程单独处理；最终版本需与主包依赖同步。

  迁移：docs/migration/phase-d-router-hotpath.md。D-5 实现及 D-7 清单已补齐；性能门槛、Linux CI 与部署验收仍未关闭。此文件不代表验收通过，不自动应用版本或发布。

- Updated dependencies [f0e9278]
- Updated dependencies [f0e9278]
  - koatty_container@4.1.0
  - koatty_lib@1.6.1
  - koatty_logger@3.1.2

Transform explicit JSON Date/nested DTO input without primitive coercion; mark approximate schema rules unresolved; emit schema-rules subpath declarations. Restore pre-release version baseline for Changesets.

Migration: `docs/migration/phase-a-f-review-fixes.md` in the monorepo. No release has been applied.

# Changelog

## Unreleased — Phase F audit fixes (2026-09-29)

- 修复 TC39 方法 DTO 元数据提前发现；集中导出 DTO JSON Schema 及纯 schema-rules 入口供 CLI 共用，修复字符串、nested、optional/each/partial 语义。
- 迁移说明：`docs/migration/phase-f-audit-fixes.md`（主仓库）。

## 4.1.0

- 新增 `PARAM_DTO_KEY` 元数据：`@Validated({ types: [Dto] })` 现在把声明的 DTO 类型（原生类 + 名字）桥接到 IoC 元数据，供运行期元数据消费者（`koatty_mcp` 工具 inputSchema）复用同一份声明；异步分支同样写入。`PARAM_CHECK_KEY` 语义保持不变，纯增量。

迁移说明：`docs/migration/phase-f-mcp-host.md`。

## Unreleased — Phase A–D completion

- reflect-metadata 按运行期依赖声明。

本轮尚未发布；验收边界见根目录 `docs/audits/phase-ad-completion-2026-09-28.md`。

## 4.0.0

### Patch Changes

- Updated dependencies
  - koatty_logger@3.1.0
  - koatty_container@4.0.0

## 3.0.0

### Minor Changes

- Phase B security hardening (koatty-hardening-and-ai-evolution-plan.md, ADR-101/102/103). Fail-closed defaults with a `security.legacyDefaults: true` rollback switch; see docs/migration/4.3.0.md for the full migration guide.

  Highlights:

  - SecurityProfile (strict/standard/development) exposed read-only as `app.security`, with a startup summary and per-item WARN when rolling back
  - body parsing failures return 400/413/415 instead of silently producing `{}`; body size limit follows the security profile (1mb in production)
  - DTO validation whitelist on by default (strict profile rejects unknown fields); `__proto__`/`constructor` keys never reach DTO instances
  - AOP aspect failures abort the business method unless opted out via `{ onError: 'log' }` or `app.security.aop.onAspectError`
  - After/AfterEach aspects receive the business result via `options.result`
  - GraphQL: profile-driven playground/introspection/depth limits, built-in depth rule, optional complexity package fails startup when configured but missing, CDN-free GraphiQL
  - uploads: profile-driven maxFiles/maxFields/maxFieldsSize, keepExtensions defaults off, array-aware temp cleanup, new `safeFilename` export
  - ops endpoints: minimal liveness body, /ready 503 while draining, /metrics behind the exposeMetrics policy (loopback/RFC1918/allowCidrs/token), Prometheus bound to 127.0.0.1, rateLimit middleware wired (default off)
  - request IDs validated (`[A-Za-z0-9._:-]{1,128}`), query fallback disabled, structured access logs, topology service header opt-in
  - WebSocket: profile maxPayload, perMessageDeflate off, Origin check, connection limits, error-message redaction, slow-consumer guard, timer cleanup on destroy
  - TLS minVersion TLSv1.2 by default; TypeORM production logs errors only with sensitive-parameter redaction; Swagger disabled in production by default
  - defect fixes: escapeHtml (&-escaping, valid entities), ReDoS-safe isNumberString, plugin run() executes once, bootstrap failures propagate, Redis default port 6379, gRPC ListServices, koatty_cli bin (CJS build), RedLocker.resetInstance, config() write loss, CLI sandbox + `apply` dry-run by default

### Patch Changes

- Updated dependencies
  - koatty_container@3.0.0
  - koatty_lib@1.6.0
  - koatty_logger@3.0.0

## 2.1.0

### Minor Changes

- build
- build

### Patch Changes

- Updated dependencies
- Updated dependencies
  - koatty_container@3.0.0
  - koatty_lib@1.5.0
  - koatty_logger@3.0.0

## 2.0.7

### Patch Changes

- build
- Updated dependencies
- Updated dependencies
  - koatty_container@2.0.9
  - koatty_lib@1.4.9
  - koatty_logger@2.8.5

## 2.0.6

### Patch Changes

- Updated dependencies
  - koatty_lib@1.4.8
  - koatty_container@2.0.6
  - koatty_logger@2.8.4

## 2.0.5

### Patch Changes

- build
- Updated dependencies
  - koatty_container@2.0.5
  - koatty_lib@1.4.7
  - koatty_logger@2.8.3

## 2.0.4

### Patch Changes

- Updated dependencies
  - koatty_logger@2.8.2
  - koatty_container@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies
- Updated dependencies
  - koatty_container@2.0.3

## 2.0.2

### Patch Changes

- patch version bump for koatty, koatty_cacheable, koatty_config, koatty_container, koatty_core, koatty_exception, koatty_graphql, koatty_lib, koatty_loader, koatty_logger, koatty_proto, koatty_router, koatty_schedule, koatty_serve, koatty_store, koatty_trace, koatty_typeorm, koatty_validation
- Updated dependencies
  - koatty_container@2.0.2
  - koatty_lib@1.4.6
  - koatty_logger@2.4.2

## 2.0.1

### Patch Changes

- Updated dependencies
  - koatty_container@2.0.1
  - koatty_logger@2.4.1

## 2.0.0

### Patch Changes

- Updated dependencies
  - koatty_container@2.0.0
  - koatty_logger@2.4.0

## 1.6.6

### Patch Changes

- build
- Updated dependencies
  - koatty_container@1.17.4
  - koatty_lib@1.4.5
  - koatty_logger@2.3.4

## 1.6.5

### Patch Changes

- build
- Updated dependencies
  - koatty_container@1.17.3
  - koatty_lib@1.4.4
  - koatty_logger@2.3.3

## 1.6.4

### Patch Changes

- build
- Updated dependencies
  - koatty_container@1.17.2
  - koatty_lib@1.4.3
  - koatty_logger@2.3.2

## 1.6.3

### Patch Changes

- Updated dependencies
  - koatty_lib@1.4.2
  - koatty_container@1.17.1
  - koatty_logger@2.3.1

## 1.6.2

### Patch Changes

- build

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.6.1](https://github.com/koatty/koatty_validation/compare/v1.6.0...v1.6.1) (2025-10-23)

## [1.6.0](https://github.com/koatty/koatty_validation/compare/v1.5.0...v1.6.0) (2025-10-22)

### Features

- improve validation with instance conversion and caching ([9865b93](https://github.com/koatty/koatty_validation/commit/9865b93e469a7df16fe67e0b85dab3191437b0a8))

## [1.5.0](https://github.com/koatty/koatty_validation/compare/v1.4.0...v1.5.0) (2025-10-22)

### Features

- comprehensive code optimization and enhancements ([f7ac738](https://github.com/koatty/koatty_validation/commit/f7ac7381a75a12365aee2a83530a12044c5e1d44))

## [1.4.0](https://github.com/koatty/koatty_validation/compare/v1.3.2...v1.4.0) (2025-06-10)

### Features

- add validation examples and decorator factory ([d448709](https://github.com/koatty/koatty_validation/commit/d44870987a808cd43c5a7ed5fabd5ca43162d0b6))

### [1.3.2](https://github.com/koatty/koatty_validation/compare/v1.3.1...v1.3.2) (2024-01-14)

### Bug Fixes

- deps ([6da3e43](https://github.com/koatty/koatty_validation/commit/6da3e437c946c9de2fc45f5319768fef0c4609b0))

### [1.3.1](https://github.com/koatty/koatty_validation/compare/v1.3.0...v1.3.1) (2024-01-07)

### Bug Fixes

- comment ([d898cf6](https://github.com/koatty/koatty_validation/commit/d898cf68bc8693f78155b7208b419dc4b11dffb4))
- dto 赋值类型 ([5a1d68d](https://github.com/koatty/koatty_validation/commit/5a1d68dea0b67e988427c54abae9bfe76a6eaf48))

## [1.3.0](https://github.com/koatty/koatty_validation/compare/v1.2.10...v1.3.0) (2024-01-03)

### Features

- 增加@CheckFunc ([d5bdc2d](https://github.com/koatty/koatty_validation/commit/d5bdc2d51cdbf6d558e376bfda51e126158d4e75))

### Bug Fixes

- export ValidFuncs ([7d42023](https://github.com/koatty/koatty_validation/commit/7d42023138e9577c9646423c4c38faffba46fb10))

### [1.2.10](https://github.com/koatty/koatty_validation/compare/v1.2.9...v1.2.10) (2023-12-16)

### Bug Fixes

- assign dto property ([2357642](https://github.com/koatty/koatty_validation/commit/2357642f6ac1479c839454d40ec4bd89f3fbd7b2))

### [1.2.9](https://github.com/koatty/koatty_validation/compare/v1.2.8...v1.2.9) (2023-09-01)

### [1.2.8](https://github.com/koatty/koatty_validation/compare/v1.2.7...v1.2.8) (2023-02-17)

### Bug Fixes

- convert type ([924449d](https://github.com/koatty/koatty_validation/commit/924449d9f5fd7b14cbe3c1532f96416e69cc4eed))

### [1.2.7](https://github.com/koatty/koatty_validation/compare/v1.2.6...v1.2.7) (2023-02-17)

### Bug Fixes

- add script ([ca82c14](https://github.com/koatty/koatty_validation/commit/ca82c14b0a2226024fb2c4476ba7353be7a2f65a))
- plainToClass convert type ([06ed46e](https://github.com/koatty/koatty_validation/commit/06ed46e21ce191dc1c9f5c18ee7d029e9b6d4abf))

### [1.2.6](https://github.com/koatty/koatty_validation/compare/v1.2.5...v1.2.6) (2023-01-09)

### Bug Fixes

- err msg ([18632d4](https://github.com/koatty/koatty_validation/commit/18632d4c9b05b1d117be7f8170da0ce014018ab8))

### [1.2.5](https://github.com/koatty/koatty_validation/compare/v1.2.4...v1.2.5) (2022-08-19)

### Bug Fixes

- merge ([52c65f4](https://github.com/koatty/koatty_validation/commit/52c65f41c46a02a3fc5735e6e22ee6a3ed5337f8))

### [1.2.4](https://github.com/koatty/koatty_validation/compare/v1.2.3...v1.2.4) (2022-05-27)

### [1.2.3](https://github.com/koatty/koatty_validation/compare/v1.2.2...v1.2.3) (2022-03-09)

### [1.2.2](https://github.com/koatty/koatty_validation/compare/v1.2.0...v1.2.2) (2022-02-25)

## [1.2.0](https://github.com/koatty/koatty_validation/compare/v1.1.0...v1.2.0) (2022-02-25)

## [1.1.0](https://github.com/koatty/koatty_validation/compare/v1.0.12...v1.1.0) (2022-02-16)

## [2.0.0](https://github.com/koatty/koatty_validation/compare/v1.0.12...v2.0.0) (2022-02-16)
