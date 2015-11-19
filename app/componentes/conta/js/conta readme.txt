# README #

Módulo que:
 - gerencia o layout da tela Minha Conta (app/componentes/conta/index.html);
 - exibe as informações do usuário logado
 - permite editar informações pessoais e da conta
 

### Pra Que Serve Este Módulo? ###

Gerenciar completamente a tela Minha Conta.  



### O que é necessário para usar o módulo? ###

Como esse é um controller filho do controller principal "appCtrl" (app.js), ele herda todos os módulos importados por ele.
Não é necessário nenhum outro módulo externo.

 
### Outras depêndencias ###

  * Evento "mudancaDeRota", proveniente do "appCtrl", para de fato modificar a rota/estado
  * $scope.token do "appCtrl"
  * Emite evento "acessouTela" no init do controller para que seja feito o log de acesso de tela
  * Evento "acessoDeTelaNotificado", proveniente do "appCtrl", para de fato exibir a tela e fazer requisições 
 	=> importante para o log correto de requisições HTTP, ao qual identifica corretamente a (tela de) origem
  * Faz referência direta ao controller de alteração de senha, de conta (conta.alterar-senha.js)
  * APIS:
	- administracao/webpagesusers

 
 ### Interação com a WEB API ###
 
  * api/administracao/webpagesusers
	 - GET : obtém as informações do usuário logado (coleção 3)
			{
				"pessoa" : {dt_nascimento: string, 
							nm_pessoa: string, 
							nu_ramal: string, 
							nu_telefone: string}, 
				"webpagesusers" : {ds_email: string,
								   ds_login: string,
								   fl_ativo: boolean,
								   id_grupo: int ou null,
								   id_pessoa: int,
								   id_users: int,
								   nu_cnpjBaseEmpresa: string ou null
								   nu_cnpjEmpresa : string ou null },
				"webpagesusersinroles" : [{RoleId : int, 
										   RoleName : string,
										   RolePrincipal : boolean}]
				"grupoempresa" : ds_nome,
				"empresa" : ds_fantasia + ' ' + filial,
				"gruposvendedor" : [{ id_grupo : int, 
									  ds_nome : string }]
			}
 
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com