# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH
#export PS1="\W \~"
# Path to your oh-my-zsh installation.
export ZSH="/home/trongdev/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
#ZSH_THEME="agnoster"
ZSH_THEME="powerlevel10k/powerlevel10k"
# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to automatically update without prompting.
# DISABLE_UPDATE_PROMPT="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git git zsh-z zsh-autosuggestions zsh-syntax-highlighting)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
alias gcm='git commit -m'
alias ga='git add'
alias gco='git checkout'
alias gtt='git status'
alias gshow='git show'
alias gb='git branch'
alias gp='git pull'
alias gcom="git checkout master"
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ff='firefox'
alias sd='shutdown now'
alias rs='shutdown -r now'
alias startmongo='sudo systemctl start mongodb'
alias showmongo='sudo systemctl status mongodb'
alias killmongo='sudo systemctl stop mongodb'
alias code='code-insiders'
alias ..='cd ../'
alias ....="cd ../../"
alias starttouchpad="synclient TouchpadOff=0"
alias stoptouchpad="synclient TouchpadOff=1"
alias networkrestart="sudo systemctl restart netctl wpa_supplicant NetworkManager"
alias networkstatus="sudo systemctl status NetworkManager netctl wpa_supplicant"
alias stopkey="xinput disable 13"    
alias startkey="xinput enable 13"
alias raminfo="sudo dmidecode --type 17"
alias open="dolphin"
alias op="thunar"
alias azure="ssh trongdev@13.76.37.227"
DEFAULT_USER="trongdev"
ibus-daemon -drx 
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
# export QT_IM_MODULE=ibus
synclient VertScrollDelta=-58
synclient HorizScrollDelta=-58
synclient TapButton1=1
synclient TapButton2=3
#ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=60' 
#ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8'
#ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#ff00ff,bg=cyan,bold,underline"
# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
#sudo sysctl -w vm.swappiness=10

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="/home/trongdev/.sdkman"
[[ -s "/home/trongdev/.sdkman/bin/sdkman-init.sh" ]] && source "/home/trongdev/.sdkman/bin/sdkman-init.sh"
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$HOME/Scripts/
export ANDROID_SDK_ROOT=$HOME/Android/Sdk/
export PATH=$ANDROID_HOME/emulator:$ANDROID_SDK/tools:$PATH
export EDITOR=/usr/bin/nano
alias zcloud="ssh trong@zcloud.4-handy.com"
alias storage="sudo du -hsx * | sort -rh | head -10"

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/anaconda/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/anaconda/etc/profile.d/conda.sh" ]; then
        . "/opt/anaconda/etc/profile.d/conda.sh"
    else
        export PATH="/opt/anaconda/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

alias py3="python3"
alias bandwidth="speedtest"
alias kdata="ssh trong@103.109.37.118"
#pass = quantrimang
alias webwork="ssh webwork@server2-kdata.4-handy.com"
#pass mothaiba@123a
alias mongolog="ssh trong@vps2-viettel.4-handy.com"
#pass
