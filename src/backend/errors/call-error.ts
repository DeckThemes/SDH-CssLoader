export class CallError extends Error {
  private title: string;
  private route: string;
  private body: string;

  constructor(title: string, route: string, body: string) {
    super(body);
    this.title = title;
    this.route = route;
    this.body = body;
  }

  getError() {
    return {
      title: this.title,
      route: this.route,
      body: this.body,
    };
  }
}
