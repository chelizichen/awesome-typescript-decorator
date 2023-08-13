import load_web_app from "../../load_server/load_web_app";

const TarsusHttpApplication = (value: any, context: ClassDecoratorContext) => {
    context.addInitializer(() => {
        load_web_app.init();
    })
}

export default TarsusHttpApplication