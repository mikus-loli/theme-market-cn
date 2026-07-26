/**
 * EdgeOne 边缘函数 - GitHub 资源代理
 * 用于加速 GitHub raw 文件和 release 附件的访问
 * 
 * 访问方式：/api/proxy?url=GitHub_URL
 */

export default async function handler(request) {
  const url = new URL(request.url);

  // 从查询参数获取目标 URL
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // 验证是否为 GitHub 链接（安全检查）
  const githubPatterns = [
    /^https:\/\/github\.com\//,
    /^https:\/\/raw\.githubusercontent\.com\//,
    /^https:\/\/github\.githubassets\.com\//,
    /^https:\/\/objects\.githubusercontent\.com\//,
    /^https:\/\/opengraph\.githubassets\.com\//,
  ];

  const isGitHubUrl = githubPatterns.some(pattern => pattern.test(targetUrl));
  if (!isGitHubUrl) {
    return new Response('Only GitHub URLs are allowed', { status: 403 });
  }

  try {
    console.log(`Proxying: ${targetUrl}`);

    // 发起请求
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://github.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`GitHub responded with ${response.status}`);
      return new Response(`GitHub error: ${response.status}`, { 
        status: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 复制响应头
    const headers = new Headers(response.headers);

    // 添加 CORS 头，允许跨域访问
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    // 删除可能导致问题的安全头
    headers.delete('Content-Security-Policy');
    headers.delete('X-Frame-Options');
    headers.delete('X-Content-Type-Options');
    headers.delete('X-XSS-Protection');

    // 对于文本类型，需要特殊处理
    const contentType = headers.get('Content-Type') || '';
    const isTextBased = /text|json|javascript|css|svg|xml/i.test(contentType);

    if (isTextBased) {
      // 文本类型：使用 arrayBuffer 避免编码问题
      const body = await response.arrayBuffer();

      // 删除可能冲突的头
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
      headers.delete('Transfer-Encoding');

      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } else {
      // 二进制类型（图片、zip等）：流式转发，节省内存
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to fetch resource',
      message: error.message,
      url: targetUrl,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}