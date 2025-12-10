import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 初始化兼容层，专门用来加载旧版的 Next.js 配置
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 加载 Next.js 的核心规则和 TypeScript 规则
  // 这相当于你原来的 ...nextVitals 和 ...nextTs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2. 配置忽略文件
  // 这相当于你原来的 globalIgnores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  }
];

export default eslintConfig;