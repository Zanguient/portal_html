/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios-cadastro", ['servicos']) 

.controller("administrativo-usuarios-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$stateParams',
                                                     '$http',
                                                     '$campos',
                                                     '$webapi',
                                                     '$apis',
                                                     '$filter',
                                                     '$autenticacao', 
                                                     function($scope,$state,$stateParams,$http,$campos,
                                                              $webapi,$apis,$filter,$autenticacao){ 
    
    var token = '';                                                    
    $scope.tela = {tipo:'Cadastro', acao:'Cadastrar'};
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.old = {pessoa:null,usuario:null,roles:[]};
    $scope.pessoa = {id:0, nome:'', data_nasc:'', telefone:'', ramal:''};
    $scope.usuario = {login:'', email:'', grupoempresa:'', empresa:''};
    $scope.roles = [];  
    var rolesSelecionadas = [];                                                    
    // Flags
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;
    $scope.validandoLogin = false;
    $scope.validandoEmail = false;
    $scope.obtendoRoles = false; 
    $scope.rolesSelecionadas = false;
    $scope.pesquisandoGruposEmpresas = false;  
    $scope.pesquisandoEmpresas = false;
    $scope.cadastrando = false;
    
    // Usuário da alteração
    /**
      * Obtém e atualiza informações do formulário do usuário
      */
    var obtemDadosDoUsuario = function(){
        // Atualiza informações
        loginValido = emailValido = true;
        $scope.usuario.email = $scope.old.usuario.ds_email;
        $scope.usuario.login = $scope.old.usuario.ds_login;
        // GRUPO EMPRESA                                                    
        if($scope.old.usuario.id_grupo === null) $scope.old.usuario.id_grupo = -1;
        else{
            $scope.pesquisandoGruposEmpresas = true;
            $webapi.get($apis.cliente.grupoempresa, [token, 0], {id:$campos.cliente.grupoempresa.id_grupo, valor: $scope.old.usuario.id_grupo})
                .then(function(dados){  
                    $scope.usuario.grupoempresa = dados.Registros[0];
                    $scope.pesquisandoGruposEmpresas = false;
                 },
                 function(failData){
                    console.log("FALHA AO OBTER GRUPO EMPRESA: " + failData.status);
                    $scope.pesquisandoGruposEmpresas = false;
                 });
        }
        if($scope.old.usuario.nu_cnpjEmpresa === null) $scope.old.usuario.nu_cnpjEmpresa = '';
        else{
            // EMPRESA  
            $scope.pesquisandoEmpresas = true;
            $webapi.get($apis.cliente.empresa, [token, 0], {id:$campos.cliente.empresa.nu_cnpj, valor: $scope.old.usuario.nu_cnpjEmpresa})
                .then(function(dados){  
                    $scope.usuario.empresa = dados.Registros[0];
                    $scope.pesquisandoEmpresas = false;
                 },
                 function(failData){
                    console.log("FALHA AO OBTER EMPRESA: " + failData.status);
                    $scope.pesquisandoEmpresas = false;
                 }); 
        }
        // Obtém os dados associados ao user
        obtemDadosDaPessoa();  
    };
    /**
      * Obtém e atualiza informações do formulário pessoa
      */                                                     
    var obtemDadosDaPessoa = function(){
        $webapi.get($apis.administracao.pessoa, [token, 0], 
                    {id:$campos.administracao.pessoa.id_pesssoa, valor: $scope.old.usuario.id_pessoa})
                .then(function(dados){
                        $scope.old.pessoa = dados.Registros[0];
                        // Atualiza informações
                        $scope.pessoa.nome = $scope.old.pessoa.nm_pessoa;
                        if($scope.old.pessoa.dt_nascimento !== null){ 
                            dataValida = true;
                            var data = new Date($scope.old.pessoa.dt_nascimento);
                            $scope.pessoa.data_nasc = data.getDate() + '/' + (data.getMonth() + 1) + '/' +  data.getFullYear();
                        }
                        $scope.old.pessoa.dt_nascimento = $scope.pessoa.data_nasc; // deixa em string
                        if($scope.old.pessoa.nu_telefone !== null) $scope.pessoa.telefone = $scope.old.pessoa.nu_telefone;
                        else $scope.old.pessoa.nu_telefone = $scope.pessoa.telefone; // deixa em string
                        if($scope.old.pessoa.nu_ramal !== null) $scope.pessoa.ramal = $scope.old.pessoa.nu_ramal;
                        else $scope.old.pessoa.nu_ramal = $scope.pessoa.ramal; // deixa em string
                        // Obtém roles do usuário
                        obtemRolesDoUsuario();
                      },
                      function(failData){
                         console.log("FALHA AO OBTER PESSOA: " + failData.status);
                         obtemRolesDoUsuario();
                      });  
    };
    /**
      * Obtém e atualiza todas as roles associadas ao usuário
      */                                                     
    var obtemRolesDoUsuario = function(){
        $webapi.get($apis.administracao.webpageusersinroles, [token, 0], 
                    {id:$campos.administracao.webpageusersinroles.UserId, valor: $scope.old.usuario.id_users})
            .then(function(dados){
                    for(var k = 0; k < dados.Registros.length; k++) $scope.old.roles.push(dados.Registros[k].RoleId);
                    obtemRoles();
                  },
                  function(failData){
                     console.log("FALHA AO OBTER ROLES DO USER: " + failData.status);
                     obtemRoles();
                  }); 
    };                                                    
    /**
      * Obtém todas as roles cadastradas
      */
    var obtemRoles = function(){
        $scope.obtendoRoles = true;  
        $webapi.get($apis.administracao.webpageroles, [token, 0, $campos.administracao.webpageroles.RoleName]) // ordenado pelo nome
            .then(function(dados){
                    $scope.obtendoRoles = false;
                    $scope.roles = dados.Registros;
                    // Atualiza informações
                    if($scope.old.usuario !== null){
                        for(var k = 0; k < $scope.old.roles.length; k++)
                            $filter('filter')($scope.roles, {RoleId:$scope.old.roles[k]})[0].selecionado = true;
                        $scope.handleRole();
                    }
                    $scope.hideAlertProgress(); // fecha o alert
                    $scope.atualizaProgressoDoCadastro(); // verificar datavalida
                  },
                  function(failData){
                     console.log("FALHA AO OBTER ROLES: " + failData.status);
                     $scope.obtendoRoles = false;
                     $scope.hideAlertProgress(); // fecha o alert
                     $scope.atualizaProgressoDoCadastro();
                  }); 
    };
                                                         
                                                         
    /**
      * Inicialização do controller
      */
    $scope.administrativoUsuariosCadastroInit = function(){
        // Obtem o token
        token = $autenticacao.getToken();
        // Exibe o alert de progress
        $scope.showAlertProgress();
        // Verifica se tem parâmetros
        if($stateParams.usuario !== null){
            $scope.tela.tipo = 'Alteração'; 
            $scope.tela.acao = 'Alterar';
            $scope.old.usuario = $stateParams.usuario;
            obtemDadosUsuario();
        }else obtemRoles(); // Obtém Roles
        // Título da página
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = $scope.tela.tipo + ' de Usuário';
        $scope.setTabCadastro(1);
        // Quando houver uma mudança de rota => Avalia se tem informações preenchidas e 
        // solicita confirmação de descarte das mesmas. Se confirmado => muda estado                                              
        $scope.$on('mudancaDeRota', function(event, state, params){
            // Verifica se possui dados preenchidos
            if($scope.tela.tipo == 'Cadastro'){
                if($scope.pessoa.nome || $scope.pessoa.data_nasc || $scope.pessoa.telefone || $scope.pessoa.ramal || 
                   $scope.usuario.email || $scope.usuario.empresa || $scope.usuario.grupoempresa || $scope.usuario.login ||
                   $scope.rolesSelecionadas){
                   if(confirm('Tem certeza que deseja descartar as informações preenchidas?')) $state.go(state, params);
                }else $state.go(state, params);
            }else{
               // Verifica se teve alterações
               if(!houveAlteracoes() || confirm('Tem certeza que deseja descartar as informações alteradas?'))
                    $state.go(state, params);    
            }
        }); 
    };
    
    /**
      * True se for cadastro. False se for alteração
      */
    $scope.ehCadastro = function(){
        return $stateParams.usuario === null;    
    };
    /**
      * Reporta se algum progresso da tela de cadastro está em curso
      */ 
    var progressoCadastro = function(emProgresso){
        $scope.cadastrando = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    
    // CADASTRO                                                     
                                                         
    /**
      * Envia o post para a api de administracao/webpageUsersInRoles, enviando o json { UserId : id_usuario, Role_Id : [<id_roles>] }
      */
    var postRoles = function(id_usuario){
        progressoCadastro(true);
        for(var k = 0; k < rolesSelecionadas.length; k++){
            var jsonRolesUsuario = {UserId : id_usuario, RoleId : rolesSelecionadas[k].RoleId};
            console.log(jsonRolesUsuario);
            // Envia
            //$webapi.post($apis.administracao.webpageusersinroles, token, jsonRolesUsuario)
            $.post($apis.administracao.webpageusersinroles + '?token=' + token, jsonRolesUsuario)
                //.then(function(dados){
                .done(function(dados){
                    console.log("ROLES IN USER POSTED");
                    console.log(dados);
                    if(k == rolesSelecionadas.length){
                        progressoCadastro(false);
                        alert("Cadastrado com sucesso!");
                        // Reseta os dados
                        $scope.pessoa = $scope.usuario = {};
                        $scope.rolesSelecionadas = false;
                        // Volta para a tela de Usuários
                        $scope.goAdministrativoUsuarios();
                    }
                  }//,function(failData){
                  ).fail(function(failData){      
                     console.log("FALHA AO CADASTRAR ROLES DO USUARIO: " + failData.status);
                     progressoCadastro(false);
                  });
        }
    };
    /**
      * Envia o post para a api de administracao/webpageUsers, enviando o json { ds_login : login, ds_email : email, id_pessoa : id_pessoa}
      * enviando, se preenchido pelo usuário, { id_grupo : id_grupo_empresa, nu_cnpjEmpresa : cnpj_empresa }
      */
    var postUsuario = function(id_pessoa){
        var jsonUsuario = {};
        // Obrigatórios
        jsonUsuario.ds_login = $scope.usuario.login;
        jsonUsuario.ds_email = $scope.usuario.email;
        jsonUsuario.id_pessoa = id_pessoa;
        // Não-Obrigatórios
        if($scope.usuario.grupoempresa.ds_nome) jsonUsuario.id_grupo = $scope.usuario.grupoempresa.id_grupo;
        if($scope.usuario.empresa.ds_fantasia) jsonUsuario.nu_cnpjEmpresa = $scope.usuario.empresa.nu_cnpj;
        console.log(jsonUsuario);
        // Envia
        //$webapi.post($apis.administracao.webpageusers, token, jsonUsuario)
        $.post($apis.administracao.webpageusers + '?token=' + token, jsonUsuario)
                //.then(function(id_usuario){
                .done(function(id_usuario){
                    postRoles(id_usuario);
                  }//,function(failData){
                  ).fail(function(failData){
                     console.log("FALHA AO CADASTRAR USUARIO: " + failData.status);
                     progressoCadastro(false);
                  });  
    };
    /**
      * Envia o post para a api de administracao/pessoa, enviando o json { nm_pessoa : nome }
      * enviando, se preenchido pelo usuário, { dt_nascimento : data_nasc, nu_telefone : telefone, nu_ramal : ramal }
      */
    var postPessoa = function(){
        var jsonPessoa = {};
        // Obrigatório
        jsonPessoa.nm_pessoa = $scope.pessoa.nome;
        // Não-Obrigatórios
        if($scope.pessoa.data_nasc){
            var data = $scope.pessoa.data_nasc.split('/');
            var dt = new Date(data[2], data[1] - 1, data[0]);
            jsonPessoa.dt_nascimento = '/Date(' + dt.getTime() + ')/';
        }
        if($scope.pessoa.telefone) jsonPessoa.nu_telefone = $scope.pessoa.telefone;
        if($scope.pessoa.ramal) jsonPessoa.nu_ramal = $scope.pessoa.ramal;
        // Envia
        console.log(jsonPessoa);
        //$webapi.post($apis.administracao.pessoa, token, jsonPessoa)
        $.post($apis.administracao.pessoa + '?token=' + token, jsonPessoa)
                //.then(function(id_pessoa){
                .done(function(id_pessoa){
                    postUsuario(id_pessoa);
                  }//,function(failData){
                  ).fail(function(failData){
                     console.log("FALHA AO CADASTRAR PESSOA: " + failData.status);
                     progressoCadastro(false);
                  });  
    };
    /**
      * Cadastra o usuário na base de dados
      */
    var cadastraUsuario = function(){
        // Cadastra
        progressoCadastro(true)
        postPessoa();
        /* PESSOA
        var jsonPessoa = {};
        // Obrigatório
        jsonPessoa.nm_pessoa = $scope.pessoa.nome;
        // Não-Obrigatórios
        if($scope.pessoa.data_nasc) jsonPessoa.dt_nascimento = $scope.pessoa.data_nasc;
        if($scope.pessoa.telefone) jsonPessoa.nu_telefone = $scope.pessoa.telefone;
        if($scope.pessoa.ramal) jsonPessoa.nu_ramal = $scope.pessoa.ramal;
        // USUÁRIO
        var jsonUsuario = {};
        // Obrigatórios
        jsonUsuario.ds_login = $scope.usuario.login;
        jsonUsuario.ds_email = $scope.usuario.email;
        // Não-Obrigatórios
        if($scope.usuario.grupoempresa.ds_nome) jsonUsuario.id_grupo = $scope.usuario.grupoempresa.id_grupo;
        if($scope.usuario.empresa.ds_fantasia) jsonUsuario.nu_cnpjEmpresa = $scope.usuario.empresa.nu_cnpj;
        // ROLES DO USUÁRIO
        var r = [];
        for(var k in rolesSelecionadas) r.push(rolesSelecionadas[k].RoleId);
        // JSON DE ENVIO
        var json = { 
                "pessoa" : jsonPessoa,
                "webpagesusers" : jsonUsuario,
                "webpagesusersinroles" : r
            };
        // Envia
        //$webapi.post($apis.administracao.pessoa, token, jsonPessoa)
        $.post($apis.administracao.pessoa + '?token=' + token, json)
                //.then(function(id_pessoa){
                .done(function(id_pessoa){
                    progressoCadastro(false);
                    alert("Cadastrado com sucesso!");
                    // Reseta os dados
                    $scope.pessoa = $scope.usuario = {};
                    $scope.rolesSelecionadas = false;
                    // Volta para a tela de Usuários
                    $scope.goAdministrativoUsuarios();
                  }//,function(failData){
                  ).fail(function(failData){
                     console.log("FALHA AO CADASTRAR USUÁRIO: " + failData.status);
                     progressoCadastro(false);
                  });  */
    };
     
                                                         
    // ALTERAÇÃO
    /**
      * Retorna true se houve alterações no formulário
      */
    var houveAlteracoes = function(){
        if($scope.old.usuario === null) return false;
        // PESSOA
        if($scope.old.pessoa.nm_pessoa !== $scope.pessoa.nome){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - NOME"); 
           return true;
        }
        if($scope.old.pessoa.dt_nascimento !== $scope.pessoa.data_nasc){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - DATA NASC"); 
           return true; 
        }
        if($scope.old.pessoa.nu_telefone !== $scope.pessoa.telefone){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - TELEFONE"); 
           return true;    
        }
        if($scope.old.pessoa.nu_ramal !== $scope.pessoa.ramal){
            //console.log("HOUVE ALTERAÇÃO - PESSOA - RAMAL"); 
            return true;
        }
           // USUÁRIO
        if($scope.old.usuario.ds_email !== $scope.usuario.email){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMAIL"); 
           return true; 
        }
        if($scope.old.usuario.ds_login !== $scope.usuario.login){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - LOGIN"); 
           return true; 
        } 
        if(($scope.old.usuario.id_grupo === null ^ $scope.usuario.grupoempresa.ds_nome) ||
            $scope.old.usuario.id_grupo !== $scope.usuario.grupoempresa.id_grupo){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - GRUPO EMPRESA"); 
           return true; 
        } 
        if(($scope.old.usuario.nu_cnpjEmpresa === null ^ $scope.usuario.empresa.ds_fantasia) ||
            $scope.old.usuario.nu_cnpjEmpresa !== $scope.usuario.empresa.nu_cnpj){ 
            //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMPRESA"); 
            return true;
        }
        // ROLES
        if(rolesSelecionadas.length !== $scope.old.roles.length){ 
            //console.log("HOUVE ALTERAÇÃO - ROLE");
            return true;
        }
        for(var k = 0; k < $scope.old.roles.length; k++){
           if($filter('filter')(rolesSelecionadas, {RoleId:$scope.old.roles[k]}).length == 0){ 
               //console.log("HOUVE ALTERAÇÃO - ROLE");
               return true; 
           }
        }
        return false;
    }; 
    /**
      * Altera as informações do usuário
      */                                                     
    var alteraUsuario = function(){
        if(houveAlteracoes()) console.log("HOUVE ALTERAÇÕES");
        else console.log("NÃO HOUVE ALTERAÇÕES");
    };
     
                                                         
    /**
      * Armazena as informações
      */
    $scope.armazenaInformacoesDoUsuario = function(){
        if($scope.formCadastroUsuario.$valid && $scope.dataValida() && $scope.loginValido() && $scope.emailValido() && $scope.rolesSelecionadas) {
            if($scope.ehCadastro()) cadastraUsuario();
            else alteraUsuario();
        }else{
            // Verifica quais campos estão faltando/errados
            if($scope.formCadastroUsuario.pessoaNome.$invalid){
                alert("Nome é um campo obrigatório!");
                $scope.setTabCadastro(1);    
            }else if($scope.formCadastroUsuario.pessoaDataNasc.$invalid || !$scope.dataValida()){
                alert("Data de nascimento digitada é inválida! Formato: DD/MM/AAAA (DD: dia. MM : mês. AAAA: ano");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.pessoaTelefone.$invalid){
                alert("Número de telefone informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.pessoaRamal.$invalid){
                alert("Número do ramal informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.usuarioLogin.$invalid || !$scope.loginValido()){
                alert("Informe um login válido!");
                $scope.setTabCadastro(2);
            }else if($scope.formCadastroUsuario.usuarioEmail.$invalid || !$scope.emailValido()){
                alert("Informe um e-mail válido!");
                $scope.setTabCadastro(2);
            }else if(!$scope.rolesSelecionadas){
                alert("Selecione pelo menos um privilégio!");
                $scope.setTabCadastro(3);
            }else alert("Por favor, verifique novamente se os dados preenchidos são válidos");
        }
    };
                                                         
                                                         
                                                         
    // Filtro
    $scope.buscaGrupoEmpresas = function(texto){
       $scope.pesquisandoGruposEmpresas = true;
       // Obtém a URL                                                      
       var url = $webapi.getUrl($apis.cliente.grupoempresa, 
                                  [token, 0, $campos.cliente.grupoempresa.ds_nome, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:$campos.cliente.grupoempresa.ds_nome, valor: '%' + texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           $scope.pesquisandoGruposEmpresas = false;
           return dados.data.Registros;
        },function(failData){
             console.log("FALHA AO OBTER GRUPO EMPRESAS FILTRADOS: " + failData.status);
             $scope.pesquisandoGruposEmpresas = false;
             return [];
          });
    };
    $scope.buscaEmpresas = function(texto){
       $scope.pesquisandoEmpresas = true;
       // Obtém a URL                                                      
       var url = $webapi.getUrl($apis.cliente.empresa, 
                                  [token, 0, $campos.cliente.empresa.ds_fantasia, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:$campos.cliente.empresa.ds_fantasia, valor: '%' + texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           $scope.pesquisandoEmpresas = false;
           return dados.data.Registros;
        },function(failData){
             console.log("FALHA AO OBTER EMPRESAS FILTRADAS: " + failData.status);
             $scope.pesquisandoEmpresas = false;
             return [];
          });
    };                                                     
                                                         
                                                         
                                                         
    // TAB
    
    // Vai para a tab anterior
    $scope.setTabAnterior = function(){
        if($scope.tabCadastro > 1) $scope.setTabCadastro($scope.tabCadastro - 1);
    };
    // Vai para a próxima tab
    $scope.setProximaTab = function(){
        if($scope.tabCadastro < 4) $scope.setTabCadastro($scope.tabCadastro + 1);
    };
    // Modifica a tab atual
    $scope.setTabCadastro = function(tab) {
        $scope.tabCadastro = tab;
    };
    // Retorna true se a tab informada é a selecionada
    $scope.tabCadastroSelecionada = function(tab){
        return $scope.tabCadastro === tab;
    };
    
    // Validação dos campos
    // PESSOA
    $scope.dataValida = function(){
        return dataValida || !$scope.pessoa.data_nasc;    
    };
    $scope.validaData = function(){
        if($scope.pessoa.data_nasc){
            var parts = $scope.pessoa.data_nasc.split("/");
            var data = new Date(parts[2], parts[1] - 1, parts[0]);//Date.parse($scope.pessoa.data_nasc);
            // Verifica se a data é válida
            dataValida = parts[0] == data.getDate() && (parts[1] - 1) == data.getMonth() && parts[2] == data.getFullYear();
        }else dataValida = false;
    };
    // USUÁRIO
    $scope.emailValido = function(){
        return emailValido;    
    }
    $scope.loginValido = function(){
        return loginValido;    
    }
    //Valida e-mail
    $scope.validaEmail = function(){
        if($scope.usuario.email){
            if($scope.old.usuario !== null && $scope.old.usuario.ds_email === $scope.usuario.email){ 
                // Não alterou o e-mail
                $('#labelEmailEmUso').hide();
                emailValido = true;
                $('#icon-email').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoEmail = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.ds_email, valor:$scope.usuario.email});
            // Verifica se a requisição foi respondida com sucesso
            dadosAPI.then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelEmailEmUso').show();
                                emailValido = false;
                                $('#icon-email').show();
                            }else{
                                $('#labelEmailEmUso').hide();
                                emailValido = true;
                                $('#icon-email').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoEmail = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR E-MAIL");
                            $scope.validandoEmail = false;
                        });
        }else{
            emailValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    //Valida login
    $scope.validaLogin = function(){
        if($scope.usuario.login){
            if($scope.old.usuario !== null && $scope.old.usuario.ds_login === $scope.usuario.login){ 
                // Não alterou o login
                $('#labelLoginEmUso').hide();
                loginValido = true;
                $('#icon-login').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoLogin = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.ds_login, valor:$scope.usuario.login});
            // Verifica se a requisição foi respondida com sucesso
            dadosAPI.then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelLoginEmUso').show();
                                loginValido = false;
                                $('#icon-login').show();
                            }else{
                                $('#labelLoginEmUso').hide();
                                loginValido = true;
                                $('#icon-login').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoLogin = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR LOGIN");
                            $scope.validandoLogin = false;
                        });
        }else{
            loginValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    // ROLES
    $scope.handleRole = function(){
      // Obtém o array das roles que tem o campo 'selecionado' com valor true
      rolesSelecionadas = $filter('filter')($scope.roles, {selecionado:true});
      $scope.rolesSelecionadas = rolesSelecionadas.length > 0;
      $scope.atualizaProgressoDoCadastro();
    };
    
    // Progresso do cadastro
    // Form Pessoa                                                     
    var getPercentualFormPessoa = function(){
        var percentual = $scope.pessoa.nome ? 25 : 0; // nome => obrigatório
        if(percentual > 0){
            // Avalia se há conteúdo no input. Se tiver, tem que ser um conteúdo válido
            var conteudoData = '';
            var conteudoTelefone = '';
            var conteudoRamal = '';
            if($scope.formCadastroUsuario){
                conteudoData = $scope.formCadastroUsuario.pessoaDataNasc.$viewValue;
                conteudoTelefone = $scope.formCadastroUsuario.pessoaTelefone.$viewValue;
                conteudoRamal = $scope.formCadastroUsuario.pessoaRamal.$viewValue;
            }
            percentual += !conteudoData || dataValida ? 25 : 0; // data
            percentual += !conteudoTelefone || $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += !conteudoRamal || $scope.pessoa.ramal ? 25 : 0; // telefone
        }else{
            percentual += dataValida ? 25 : 0; // data
            percentual += $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += $scope.pessoa.ramal ? 25 : 0; // telefone
        }
        return percentual;    
    };
    // Form Usuário                                                    
    var getPercentualFormUsuario = function(){
        var percentual = $scope.loginValido() ? 25 : 0; // login => obrigatório
        percentual += $scope.emailValido() ? 25 : 0; // e-mail => obrigatório
        if(percentual > 0){
            percentual += $scope.loginValido() ? 25 : 0; // tanto faz o cara ter ou não associado um grupo empresa
            percentual += $scope.emailValido() ? 25 : 0; // tanto faz o cara ter ou não associado uma empresa
        }else{
            percentual += $scope.usuario.empresa.ds_fantasia ? 25 : 0;
            percentual += $scope.usuario.grupoempresa.ds_nome ? 25 : 0;
        }
        return percentual;    
    };
    // Form Roles
    var getPercentualFormRoles = function(){
        return $scope.rolesSelecionadas ? 100 : 0 ; 
    };
    // Progresso                                                     
    $scope.atualizaProgressoDoCadastro = function(){
        // São obrigatórios: 1 campo para pessoa (nome), 2 campos obrigatórios para usuário (login e e-mail) e alguma role
        var progressoPessoa = getPercentualFormPessoa();
        var progressoUsuario = getPercentualFormUsuario();
        var progressoRoles = getPercentualFormRoles();
        // Atualiza
        var percent = (progressoPessoa + progressoUsuario + progressoRoles) / 3;
        $('#form_wizard_1').find('.progress-bar').css({
            width: percent + '%'
        });    
    };
    
}]);