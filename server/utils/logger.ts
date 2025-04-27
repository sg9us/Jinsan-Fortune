
import winston from 'winston';
import chalk from 'chalk';

const { combine, timestamp, printf } = winston.format;

// 로그 포맷 정의
const logFormat = printf(({ level, message, timestamp }) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString('ko-KR');
  
  switch(level) {
    case 'info':
      return `${chalk.gray(formattedTime)} ${chalk.green('✓')} ${message}`;
    case 'warn':
      return `${chalk.gray(formattedTime)} ${chalk.yellow('⚠')} ${message}`;
    case 'error':
      return `${chalk.gray(formattedTime)} ${chalk.red('✗')} ${message}`;
    case 'debug':
      return `${chalk.gray(formattedTime)} ${chalk.blue('→')} ${message}`;
    default:
      return `${chalk.gray(formattedTime)} ${message}`;
  }
});

// Winston 로거 생성
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// 로깅 함수들
export const log = {
  info: (message: string, context?: string) => {
    logger.info(context ? `[${context}] ${message}` : message);
  },
  
  success: (message: string, context?: string) => {
    logger.info(chalk.green(context ? `[${context}] ${message}` : message));
  },
  
  warn: (message: string, context?: string) => {
    logger.warn(chalk.yellow(context ? `[${context}] ${message}` : message));
  },
  
  error: (message: string, context?: string) => {
    logger.error(chalk.red(context ? `[${context}] ${message}` : message));
  },
  
  debug: (message: string, context?: string) => {
    logger.debug(context ? `[${context}] ${message}` : message);
  }
};

// 서버 시작 배너 출력
export const printServerBanner = (port: number, host: string) => {
  console.log('\n' + chalk.cyan('┌──────────────────────────────────────────┐'));
  console.log(chalk.cyan('│            팔자노트 서버 시작됨            │'));
  console.log(chalk.cyan('├──────────────────────────────────────────┤'));
  console.log(chalk.cyan('│ ') + chalk.white(`환경: ${process.env.NODE_ENV}`).padEnd(42) + chalk.cyan(' │'));
  console.log(chalk.cyan('│ ') + chalk.white(`URL: ${host}`).padEnd(42) + chalk.cyan(' │'));
  console.log(chalk.cyan('│ ') + chalk.white(`포트: ${port}`).padEnd(42) + chalk.cyan(' │'));
  console.log(chalk.cyan('└──────────────────────────────────────────┘\n'));
};
