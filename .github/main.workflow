workflow "Test, build, deploy on push" {
  resolves = ["Notify Start", "Notify End"]
  on = "push"
}

action "Notify Start" {
  uses = "swinton/httpie.action@8ab0a0e926d091e0444fcacd5eb679d2e2d4ab3d"
  args = ["POST", "https://discordapp.com/api/webhooks/$DC_ID/$DC_TOKEN", "username=GitHub", "content='`hams-near-me` push received :+1: $GITHUB_SHA'"]
  secrets = ["DC_ID", "DC_TOKEN"]
}

action "Install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "Unit Tests" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Install"]
  args = "test"
}

action "Deploy" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Unit Tests"]
  args = "run deploy:ci"
  secrets = ["CONFIG_KEY", "CONFIG_IV"]
}

action "Notify End" {
  uses = "swinton/httpie.action@8ab0a0e926d091e0444fcacd5eb679d2e2d4ab3d"
  secrets = ["DC_ID", "DC_TOKEN"]
  needs = ["Deploy"]
  args = ["POST", "https://discordapp.com/api/webhooks/$DC_ID/$DC_TOKEN", "username=GitHub", "content=`hams-near-me` Actions Complete :tada: $GITHUB_SHA'"]
}