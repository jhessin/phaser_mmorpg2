type HandlebarOptions = {
  viewEngine?: {
    extName?: string,
    defaultLayout?: string,
    partialsDir?: string,
    layoutsDir?: string,
  }
  viewPath?: string,
  extName?: string,
};

declare module 'nodemailer-express-handlebars' {
  function nodemailerExpressHandlebars(data: HandlebarOptions): any;

  module nodemailerExpressHandlebars { }
  export = nodemailerExpressHandlebars;
}
