# README #

M�dulo que:
 - gerencia o layout da tela Minha Conta (app/componentes/conta/index.html);
 - exibe as informa��es do usu�rio logado
 - permite editar informa��es pessoais e da conta
 

### Pra Que Serve Este M�dulo? ###

Gerenciar completamente a tela Minha Conta.  



### O que � necess�rio para usar o m�dulo? ###

Como esse � um controller filho do controller principal "appCtrl" (app.js), ele herda todos os m�dulos importados por ele.
N�o � necess�rio nenhum outro m�dulo externo.

 
### Outras dep�ndencias ###

  * Evento "mudancaDeRota", proveniente do "appCtrl", para de fato modificar a rota/estado
  * $scope.token do "appCtrl"
  * Emite evento "acessouTela" no init do controller para que seja feito o log de acesso de tela
  * Evento "acessoDeTelaNotificado", proveniente do "appCtrl", para de fato exibir a tela e fazer requisi��es 
 	=> importante para o log correto de requisi��es HTTP, ao qual identifica corretamente a (tela de) origem
  * Faz refer�ncia direta ao controller de altera��o de senha, de conta (conta.alterar-senha.js)
  * APIS:
	- administracao/webpagesusers

 
 ### Intera��o com a WEB API ###
 
  * api/administracao/webpagesusers
	 - GET : obt�m as informa��es do usu�rio logado (cole��o 3)
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