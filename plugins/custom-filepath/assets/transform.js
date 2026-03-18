const transformPath = (input, config) => {
  // 1. run regex replacements
  // 2. strip prefix
  // 3. add prefix
  // 4. check if we are adding url
  //  add space encode
  //  add prefix
  const spaceEncode = config?.uriSpaceReplacement ?? "%20"

  // strip prefix
  input = input.replace(config?.pathPrefixStrip ?? "", config.pathPrefixAdd ?? "")

  if (config?.regexPattern) {
    input = input.replace(new RegExp(config.regexPattern, "g"), config?.regexReplace ?? "")
  }
  if (config?.uriPrefix) {
    input = config.uriPrefix + input.replace(/ /g, spaceEncode)
  }
  return input
}