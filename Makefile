NAME := $(notdir $(CURDIR))

# COLORS
ERASE := \033[2K\033[1A\r
CLEAN_TEXT := \033[36m
INFO_TEXT := \033[35m
GOOD_TEXT := \033[32m
BAD_TEXT := \033[31m
RESET := \033[0m

all:
	printf "$(INFO_TEXT)   Creating $(NAME)...$(RESET)\r⚙️\n"
	docker compose up --build -d

build:
	printf "$(INFO_TEXT)   Building images (no cache)...$(RESET)\r⚙️\n"
	docker compose build --no-cache

clean:
	printf "$(INFO_TEXT)   Stoping $(NAME)...$(RESET)\r🛑\n"
	docker compose down

fclean: clean
	printf "$(INFO_TEXT)   Removing images...$(RESET)\r🗑️\n"
	-docker rmi -f $(NAME)-web
	printf "$(INFO_TEXT)   Removing volumes...$(RESET)\r🗑️\n"
	-docker volume rm `docker volume ls -q | grep $(NAME)`

re: fclean build all

.PHONY: all clean fclean re
.SILENT: