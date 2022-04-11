#!/bin/bash
set -e

NAMESPACE="MD2html"
BASENAME="md2html"

BUILD_DIR="build"
# rollupjs でビルドされた結果(定義は "rollup.js" でされている).
OUT_MAIN="${BUILD_DIR}/main.js"
# 上記ファイルに結合して Apps Scpirt で参照できるようにするファイル.
SRC_INDEX="src/index.js"

# Apps Scipt へ push する用.
# iife 形式でビルドする(Apps Scriptからは参照できない状態).
# LICENSE の情報をまとめる.
npx rollup --config
# App Script で参照できるようにするファイルと結合.
cat "${SRC_INDEX}" "${OUT_MAIN}" > "${BUILD_DIR}/${BASENAME}.js"

# Assets に含める LICENSE ファイルをコピー.
cp LICENSE "${BUILD_DIR}/LICENSE.txt"

# 型定義から良くない方法で export を外す(モジュールにしないため)
# index.d.ts へ移動.
sed -e 's/^export \(declare namespace\)/\1/' -- "${BUILD_DIR}/src/${BASENAME}.d.ts" > "index.d.ts"
rm "${BUILD_DIR}/src/${BASENAME}.d.ts"

# 作業用ファイルなどを削除.
npx rimraf "${OUT_MAIN}" "${BUILD_DIR}/src" "${BUILD_DIR}/test"
