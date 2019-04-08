FROM maven:3.6-jdk-11


RUN apt-get update && apt-get -y install python-pip python-yaml python-dev groff
RUN pip install awscli
RUN curl --silent --show-error --fail -o /usr/local/bin/ecs-cli \
https://s3.amazonaws.com/amazon-ecs-cli/ecs-cli-linux-amd64-latest
RUN chmod +x /usr/local/bin/ecs-cli


ARG RELEASE

# Install node.js and yarn
RUN curl -sL https://deb.nodesource.com/setup_8.x > node_install.sh
RUN chmod +x ./node_install.sh
RUN ./node_install.sh
RUN curl -sS http://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y apt-utils nodejs yarn groff

# Install serverless cli
RUN yarn global add serverless@${RELEASE}

ENTRYPOINT [ "serverless" ]