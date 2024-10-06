# 概要

AWS 学習用環境を管理するための CDK プロジェクトです

## 方針

基本的なインフラ要素(VPC など)をこのリポジトリで管理します

アプリケーションに関するインフラは個別のアプリケーションリポジトリで扱います

## インフラ構成図

![](./aws-ops.drawio.svg)

## デプロイ

```
aws sts assume-role --role-arn arn:aws:iam::{AWS_ACCOUNT_ID}:role/adminRoleForSts --role-session-name develop --duration-seconds $((60*60*12))
cdk deploy --profile develop
```

## クリーンアップ

```
aws sts assume-role --role-arn arn:aws:iam::{AWS_ACCOUNT_ID}:role/adminRoleForSts --role-session-name develop --duration-seconds $((60*60*12))
cdk destroy --profile develop
```
