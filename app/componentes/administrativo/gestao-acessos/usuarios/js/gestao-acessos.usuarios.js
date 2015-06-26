/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", ['servicos']) 

.controller("administrativo-usuariosCtrl", ['$scope','$state', '$campos', function($scope,$state,$campos){ 
    
    
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
    };
    
}])


// CADASTRO

.controller("administrativo-usuarios-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$campos',
                                                     '$webapi',
                                                     '$apis',
                                                     '$autenticacao', function($scope,$state,$campos,$webapi,$apis,$autenticacao){ 
    
    var token = '';
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.aa = 'meu nome';
    $scope.pessoa = {nome:'', data_nasc:'', telefone:'', ramal:''};
    $scope.usuario = {login:'', email:'', grupoempresa:undefined, empresa:undefined};
    $scope.roles = [];
    // Flags
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;
    $scope.validandoLogin = false;
    $scope.validandoEmail = false;                                                    
    
    // Inicialização do controller
    $scope.administrativoUsuariosCadastroInit = function(){
        // Título da página
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Cadastro de Usuário';
        $scope.setTabCadastro(1);
        $scope.atualizaProgressoDoCadastro();
        token = $autenticacao.getToken();
    };
    
    
    // CADASTRO
    
    // Vai para a tab anterior
    $scope.setTabAnterior = function(){
        if($scope.tabCadastro > 1) $scope.setTabCadastro($scope.tabCadastro - 1);
    };
    // Vai para a próxima tab
    $scope.setProximaTab = function(){
        if($scope.tabCadastro < 4) $scope.setTabCadastro(scope.tabCadastro + 1);
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
    $scope.validaData = function(){
        // fazer...
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
            $scope.validandoEmail = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.email, valor:$scope.usuario.email});
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
            $scope.validandoLogin = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.login, valor:$scope.usuario.login});
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
    
    // Progresso do cadastro
    $scope.atualizaProgressoDoCadastro = function(){
        // São obrigatórios: 1 campo para pessoa (nome), 2 campos obrigatórios para usuário (login e e-mail) e alguma role
        var progressoPessoa = $scope.pessoa.nome ? 100 : 0;
        var progressoUsuario = ($scope.loginValido() ? 50 : 0) + ($scope.emailValido() ? 50 : 0);
        var progressoRoles = $scope.roles.length > 0 ? 100 : 0;
        // Se foi preenchida a data, ela deve ser válida
        progressoPessoa -= $scope.pessoa.data && !dataValida ? 50 : 0;
        // Atualiza
        var percent = (progressoPessoa + progressoUsuario + progressoRoles) / 3;
        $('#form_wizard_1').find('.progress-bar').css({
            width: percent + '%'
        });    
    };
    
}]);